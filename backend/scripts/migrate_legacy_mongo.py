"""Import raw MongoDB Extended JSON arrays into the current PostgreSQL schema.

On the old server, pause application writes, then export from the app directory:

    cd /path/to/victoriautosServer
    umask 077
    mkdir -p /tmp/victoriautos-mongo-export
    export mongoUrl="$(node -r dotenv/config -p 'process.env.mongoUrl')"
    mongosh "$mongoUrl" --quiet --eval 'print(EJSON.stringify(db.cars.find().toArray()))' > /tmp/victoriautos-mongo-export/cars.json
    mongosh "$mongoUrl" --quiet --eval 'print(EJSON.stringify(db.interes_forms.find().toArray()))' > /tmp/victoriautos-mongo-export/interes_forms.json
    mongosh "$mongoUrl" --quiet --eval 'print(EJSON.stringify(db.ofertas_forms.find().toArray()))' > /tmp/victoriautos-mongo-export/ofertas_forms.json
    mongosh "$mongoUrl" --quiet --eval 'print(EJSON.stringify(db.compra_forms.find().toArray()))' > /tmp/victoriautos-mongo-export/compra_forms.json
    mongosh "$mongoUrl" --quiet --eval 'print(EJSON.stringify(db.users.find().toArray()))' > /tmp/victoriautos-mongo-export/users.json
    mongosh "$mongoUrl" --quiet --eval 'print(EJSON.stringify(db.tramites.find().toArray()))' > /tmp/victoriautos-mongo-export/tramites.json
    mongosh "$mongoUrl" --quiet --eval 'print(EJSON.stringify(db.platesearches.find().toArray()))' > /tmp/victoriautos-mongo-export/platesearches.json
    unset mongoUrl

Alternatively, for each collection:
    mongoexport --uri "$mongoUrl" --collection cars --jsonArray --out /tmp/victoriautos-mongo-export/cars.json

Use raw database exports, NOT API/Mongoose projections: private car fields and
user salt/hash must be included. Relaxed and canonical EJSON are both accepted.
Transfer the export directory securely; it contains PII and password hashes.

On the destination, from backend/ with DATABASE_URL configured:
    uv run alembic upgrade head
    uv run python scripts/migrate_vehicle_catalog.py --source "$LEGACY_CATALOG_DSN"
    uv run python scripts/migrate_legacy_mongo.py --export-dir /path/to/export --images-root /path/to/old/public/images --dry-run
    uv run python scripts/migrate_legacy_mongo.py --export-dir /path/to/export --images-root /path/to/old/public/images
    rsync -av /path/to/old/public/images/ data/images/

Use the configured IMAGES_DIR instead of data/images/ if overridden. Images are
only inspected, never copied or renamed by this script. Review folder rename
warnings before serving images. Run a final export after pausing legacy writes;
reruns skip existing IDs, they do not synchronize subsequent edits.

All inserts share one transaction. Dry-run executes the inserts then rolls back;
its inserted counts mean "would insert". Missing files are logged and skipped.
Malformed records, username/plate uniqueness conflicts, and unresolved required
plate-search users abort the entire import. Unresolved optional car refs become
NULL with a warning. No catalog data is imported here. Keep this script's UUID
namespace unchanged between runs.
"""  # noqa: E501

import argparse
import asyncio
import json
import logging
import math
import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Any
from uuid import UUID, uuid5

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.core.security import legacy_password_hash
from victoriautos_backend.db.session import AsyncSessionLocal
from victoriautos_backend.models.car import Car, CarStatus
from victoriautos_backend.models.compra_form import CompraForm
from victoriautos_backend.models.interes_form import InteresForm
from victoriautos_backend.models.oferta_form import OfertaForm
from victoriautos_backend.models.plate_search import PlateSearch
from victoriautos_backend.models.tramite import Tramite
from victoriautos_backend.models.user import User

logger = logging.getLogger(__name__)
NAMESPACE = UUID("657974ad-e26f-5e00-b154-cb9704bfe537")
COLLECTIONS = {
    "cars": Car,
    "users": User,
    "ofertas_forms": OfertaForm,
    "interes_forms": InteresForm,
    "compra_forms": CompraForm,
    "tramites": Tramite,
    "platesearches": PlateSearch,
}


@dataclass
class Counts:
    inserted: int = 0
    skipped: int = 0
    warnings: int = 0

    def warn(self, context: str, message: str) -> None:
        self.warnings += 1
        logger.warning("%s: %s", context, message)


def parse_date(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, (int, float, Decimal)):
        return datetime(1970, 1, 1, tzinfo=UTC) + timedelta(milliseconds=int(value))
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def decode_ejson(value: dict) -> Any:
    """json.object_hook: nested canonical wrappers are decoded before parents."""
    if len(value) == 1:
        key, raw = next(iter(value.items()))
        if key == "$oid":
            return object_id(raw)
        if key == "$date":
            return parse_date(raw)
        if key in {"$numberInt", "$numberLong"}:
            return int(raw)
        if key == "$numberDouble":
            return float(raw)
        if key == "$numberDecimal":
            return Decimal(raw)
    return value


def object_id(value: Any) -> str:
    if not isinstance(value, str) or not re.fullmatch(r"[0-9a-fA-F]{24}", value):
        raise ValueError("Missing or invalid MongoDB ObjectId")
    return value.lower()


def legacy_id(value: str) -> UUID:
    return uuid5(NAMESPACE, object_id(value))


def text_value(value: Any) -> str:
    if isinstance(value, (float, Decimal)) and math.isfinite(value) and value == int(value):
        return str(int(value))
    return str(value)


def integer(value: Any) -> int:
    number = Decimal(str(value))
    if not number.is_finite() or number != number.to_integral_value():
        raise ValueError("Expected a finite integer")
    return int(number)


def boolean(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value in (0, "0", "false", "False"):
        return False
    if value in (1, "1", "true", "True"):
        return True
    raise ValueError("Expected a boolean")


def decimal_value(value: Any) -> Decimal:
    number = Decimal(str(value))
    if not number.is_finite():
        raise ValueError("Expected a finite decimal")
    return number


def string_list(value: Any) -> list[str]:
    # Mongoose's old array default was an empty string (sometimes stored as ['']).
    if value in (None, ""):
        return []
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        raise ValueError("Expected an array of strings")
    return value


def json_value(value: Any) -> Any:
    """Keep ordinary JSON; retain BSON-only dates/decimals as lossless EJSON."""
    if isinstance(value, datetime):
        return {"$date": value.isoformat()}
    if isinstance(value, Decimal):
        return {"$numberDecimal": str(value)}
    if isinstance(value, float) and not math.isfinite(value):
        return {"$numberDouble": str(value)}
    if isinstance(value, dict):
        return {key: json_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [json_value(item) for item in value]
    return value


def image_id(doc: dict, context: str, counts: Counts) -> UUID:
    try:
        result = UUID(str(doc.get("uuid", "")))
    except ValueError:
        result = legacy_id(doc["_id"])
        counts.warn(context, f"Invalid/missing uuid; image folder must be renamed to {result}")
    else:
        if doc["uuid"] != str(result):
            counts.warn(context, f"Noncanonical uuid; image folder must be renamed to {result}")
    return result


def check_images(root: Path, folder: Path, images: list[str], counts: Counts, context: str):
    resolved_root = root.resolve()
    directory = (root / folder).resolve()
    if not directory.is_relative_to(resolved_root):
        raise ValueError("Image directory escapes images root")
    if not directory.is_dir():
        counts.warn(context, f"Missing image folder: {folder}")
    for filename in images:
        target = (directory / filename).resolve()
        if not target.is_relative_to(directory) or not target.is_file():
            counts.warn(context, f"Missing/unsafe image file: {folder / filename}")


def reference(doc: dict, field: str, mapping: dict, counts: Counts, context: str) -> UUID | None:
    value = doc.get(field)
    if value is None:
        return None
    # Raw exports contain ObjectIds; also accept a populated reference's _id.
    key = value.get("_id") if isinstance(value, dict) else value
    result = mapping.get(key) if isinstance(key, str) else None
    if result is None:
        counts.warn(context, f"Unresolved {field} reference; mapped to NULL")
    return result


def map_document(
    collection: str, doc: dict, row_id: UUID, cars: dict, users: dict, counts: Counts
) -> dict:
    context = f"{collection}/{doc['_id']}"
    row = {"id": row_id}
    if collection != "platesearches":
        for old, new in (("createdAt", "created_at"), ("updatedAt", "updated_at")):
            if doc.get(old) is not None:
                row[new] = parse_date(doc[old])

    # Explicit field groups mirror the legacy schemas; absent optional fields use
    # target defaults, while absent required fields fail the transaction.
    fields = {
        "cars": (
            "marca linea km matricula color transmision combustible cilindraje traccion "
            "direccion frenos airbag placa vin chasis_no motor_no importacion_no"
        ),
        "users": "username firstname lastname role",
        "ofertas_forms": "nombre apellido celular email marca linea km matricula price status",
        "interes_forms": "nombre apellido celular email marca linea km price status",
        "compra_forms": "nombre apellido celular email cedula status",
        "tramites": "tramitador celular estado",
        "platesearches": "plate",
    }
    for field in fields[collection].split():
        if field in doc:
            row[field] = None if doc[field] is None else text_value(doc[field])
    if collection in {"cars", "ofertas_forms", "interes_forms"}:
        row["modelo"] = integer(doc["modelo"])
    if collection in {"cars", "ofertas_forms"}:
        row["images"] = [name for name in string_list(doc.get("images")) if name]
        if any(Path(name).name != name or name in {".", ".."} for name in row["images"]):
            raise ValueError("Images must be bare filenames")
    if collection.endswith("_forms"):
        row["wpp_check"] = boolean(doc.get("wppCheck", doc.get("wppcheck", False)))
    if collection == "cars":
        row["tipo"] = text_value(doc["Tipo"])
        row["price"] = decimal_value(doc["price"])
        try:
            row["status"] = CarStatus(doc.get("status"))
        except ValueError:
            row["status"] = CarStatus.OCULTO
            counts.warn(context, "Unknown car status; mapped to OCULTO")
        for field in ("consignacion", "featured"):
            row[field] = boolean(doc.get(field, False))
        value = doc.get("importacion_date")
        row["importacion_date"] = parse_date(value).date() if value else None
    elif collection == "users":
        row["admin"] = boolean(doc.get("admin", False))
        row["password_hash"] = legacy_password_hash(doc.get("salt", ""), doc.get("hash", ""))
    elif collection == "tramites":
        for old, new in (("fechaInicio", "fecha_inicio"), ("FechaFin", "fecha_fin")):
            if doc.get(old):
                row[new] = parse_date(doc[old])
        for field in ("documentos", "observaciones"):
            row[field] = string_list(doc.get(field))
        row["precio"] = decimal_value(doc.get("precio", 0))
    elif collection == "platesearches":
        row["user_id"] = reference(doc, "user", users, counts, context)
        if row["user_id"] is None:
            raise ValueError("Plate search requires a resolved user; include users.json")
        row["simit_result"] = json_value(doc.get("simitResult"))
        row["fasecolda_result"] = json_value(doc.get("fasecoldaResult"))
        row["retries"] = integer(doc.get("retries", 0))
        if doc.get("date"):
            row["date"] = parse_date(doc["date"])
    if collection in {"compra_forms", "tramites"}:
        row["car_id"] = reference(doc, "car", cars, counts, context)
    return row


def load_exports(export_dir: Path) -> tuple[dict, dict, dict[str, Counts]]:
    if not export_dir.is_dir():
        raise ValueError("Export directory does not exist")
    reports = {collection: Counts() for collection in COLLECTIONS}
    documents = {}
    ids = {}
    for collection in COLLECTIONS:
        path = export_dir / f"{collection}.json"
        if not path.exists():
            logger.info("%s: missing collection file; skipping", collection)
            documents[collection] = []
            ids[collection] = {}
            continue
        try:
            rows = json.loads(path.read_text(), object_hook=decode_ejson)
            if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
                raise ValueError("Expected a JSON array of documents")
            mapping = {}
            for doc in rows:
                doc["_id"] = object_id(doc.get("_id"))
                key = doc["_id"]
                row_id = (
                    image_id(doc, f"{collection}/{key}", reports[collection])
                    if collection in {"cars", "ofertas_forms"}
                    else legacy_id(key)
                )
                if key in mapping or row_id in mapping.values():
                    raise ValueError("Duplicate ObjectId or uuid in collection export")
                mapping[key] = row_id
            documents[collection] = rows
            ids[collection] = mapping
        except (ValueError, TypeError, KeyError, ArithmeticError) as exc:
            raise ValueError(f"{collection}: invalid export ({type(exc).__name__})") from exc
    return documents, ids, reports


async def import_exports(
    db: AsyncSession, export_dir: Path, *, images_root: Path | None = None, dry_run: bool = False
) -> dict[str, Counts]:
    """Own a fresh session's transaction; return per-collection committed/would-insert counts."""
    documents, ids, reports = await asyncio.to_thread(load_exports, export_dir)

    async with db.begin():
        for collection, model in COLLECTIONS.items():
            counts = reports[collection]
            for doc in documents[collection]:
                context = f"{collection}/{doc['_id']}"
                try:
                    row = map_document(
                        collection,
                        doc,
                        ids[collection][doc["_id"]],
                        ids["cars"],
                        ids["users"],
                        counts,
                    )
                    if images_root is not None and collection in {"cars", "ofertas_forms"}:
                        category = "vehiculos" if collection == "cars" else "ofertas"
                        # Check the old folder, even when a rename is required on the destination.
                        old_name = str(doc.get("uuid") or row["id"])
                        if Path(old_name).name != old_name or old_name in {".", ".."}:
                            raise ValueError("Unsafe legacy image folder name")
                        check_images(
                            images_root, Path(category) / old_name, row["images"], counts, context
                        )
                except (ValueError, TypeError, KeyError, ArithmeticError) as exc:
                    raise ValueError(f"{context}: invalid fields ({type(exc).__name__})") from exc
                try:
                    inserted = await db.scalar(
                        insert(model)
                        .values(**row)
                        .on_conflict_do_nothing(index_elements=["id"])
                        .returning(model.id)
                    )
                except SQLAlchemyError:
                    logger.error(
                        "%s: insert failed; check required fields and unique constraints", context
                    )
                    raise
                if inserted is None:
                    counts.skipped += 1
                else:
                    counts.inserted += 1
        if dry_run:
            await db.rollback()

    logger.info("%s", "DRY RUN: rolled back (inserted = would insert)" if dry_run else "Committed")
    for collection, counts in reports.items():
        logger.info(
            "%s: inserted=%d skipped=%d warnings=%d",
            collection,
            counts.inserted,
            counts.skipped,
            counts.warnings,
        )
    return reports


async def migrate(export_dir: Path, images_root: Path | None, dry_run: bool) -> None:
    async with AsyncSessionLocal() as db:
        await import_exports(db, export_dir, images_root=images_root, dry_run=dry_run)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--export-dir", type=Path, required=True)
    parser.add_argument("--images-root", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    try:
        asyncio.run(migrate(args.export_dir, args.images_root, args.dry_run))
    except (ValueError, OSError, SQLAlchemyError) as exc:
        # SQLAlchemy errors include SQL parameters (PII/passwords); never dump them.
        logger.error("Import failed; no changes committed. %s", type(exc).__name__)
        if isinstance(exc, ValueError):
            logger.error("%s", exc)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
