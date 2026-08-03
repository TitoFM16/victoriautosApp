"""Transactional publication of normalized vehicle-catalog rows to PostgreSQL."""

from __future__ import annotations

import hashlib
import uuid
from collections.abc import Iterable, Mapping
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation
from typing import Any

from sqlalchemy import func, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.models.vehicle_catalog import VehicleCatalogItem, VehicleCatalogSource
from victoriautos_backend.services.catalog_ingestion import normalize_catalog_text

MINTRANSPORTE_SOURCE = {
    "slug": "mintransporte-base-gravable",
    "name": "Ministerio de Transporte — Base gravable",
    "homepage_url": "https://mintransporte.gov.co/publicaciones/12234/base-gravable-2026/",
    "attribution": "Fuente: Ministerio de Transporte de Colombia",
    "publish_to_forms": True,
}
INVALID_CATALOG_LABELS = {
    "-",
    "0",
    "N/A",
    "NA",
    "NO APLICA",
    "NO REGISTRA",
    "SIN INFORMACION",
    "SIN INFORMACIÓN",
    "SIN LINEA",
    "SIN LÍNEA",
}


def form_vehicle_type(raw_type: Any, source_dataset_id: Any = "") -> str | None:
    """Map official source classes to the stable type codes used by existing forms."""
    vehicle_type = normalize_catalog_text(raw_type)
    dataset = normalize_catalog_text(source_dataset_id)
    if "BRIDOS" in dataset:
        return "HE"
    if any(token in vehicle_type for token in ("MOTO", "CICLOMOTOR", "CUATRIMOTO")):
        return "MOTO"
    if "DOBLECABINA" in vehicle_type or "DOBLE CABINA" in vehicle_type:
        return "PU"
    if vehicle_type == "CAMPERO":
        return "CAMP"
    if vehicle_type in {"AUTOMOVIL", "CARRO"}:
        return "AUT"
    if "CAMIONETA" in vehicle_type or vehicle_type == "CAMIONETAS Y CAMPEROS":
        return "CAM"
    if vehicle_type in {"MICROBUS", "BUSETA"}:
        return "VAN"
    if vehicle_type in {"AMBULANCIA", "CARGA"}:
        return "UTIL"
    return None


def _integer(value: Any) -> int | None:
    try:
        return int(float(str(value))) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def _decimal(value: Any) -> Decimal | None:
    try:
        return Decimal(str(value)) if value not in (None, "") else None
    except (InvalidOperation, TypeError, ValueError):
        return None


def _catalog_payload(row: Mapping[str, Any], run_id: uuid.UUID) -> dict[str, Any] | None:
    brand = normalize_catalog_text(row.get("brand"))
    line = normalize_catalog_text(row.get("line"))
    model_year = _integer(row.get("model_year"))
    if (
        not brand
        or not line
        or brand in INVALID_CATALOG_LABELS
        or line in INVALID_CATALOG_LABELS
        or model_year is None
    ):
        return None
    raw_type = normalize_catalog_text(row.get("vehicle_type"))
    dataset_id = str(row.get("source_dataset_id", ""))
    version = normalize_catalog_text(row.get("version"))
    engine_cc = _integer(row.get("engine_cc"))
    identity = "\x1f".join(
        (
            dataset_id,
            str(row.get("source_record_id", "")),
            raw_type,
            brand,
            line,
            version,
            str(model_year),
            str(engine_cc or ""),
        )
    )
    return {
        "external_key": hashlib.sha256(identity.encode()).hexdigest(),
        "source_dataset_id": dataset_id,
        "source_record_id": str(row.get("source_record_id", "")),
        "raw_vehicle_type": raw_type,
        "form_type": form_vehicle_type(raw_type, dataset_id),
        "brand": brand,
        "line": line,
        "version": version,
        "model_year": model_year,
        "engine_cc": engine_cc,
        "market_value_cop": _decimal(row.get("market_value_cop")),
        "observations": _integer(row.get("observations")) or 0,
        "active": True,
        "sync_run_id": run_id,
        "last_seen_at": func.now(),
    }


async def sync_catalog_rows(
    db: AsyncSession,
    rows: Iterable[Mapping[str, Any]],
    *,
    slug: str,
    name: str,
    homepage_url: str,
    attribution: str = "",
    publish_to_forms: bool = False,
    source_updated_at: str | None = None,
    batch_size: int = 2_000,
) -> int:
    """Upsert one complete source snapshot, then retire rows absent from that snapshot.

    The caller controls the transaction. If download, parsing, or any batch fails, no old
    active rows are retired.
    """
    run_id = uuid.uuid4()
    source_stmt = (
        insert(VehicleCatalogSource)
        .values(
            slug=slug,
            name=name,
            homepage_url=homepage_url,
            attribution=attribution,
            publish_to_forms=publish_to_forms,
            source_updated_at=source_updated_at,
            item_count=0,
        )
        .on_conflict_do_update(
            index_elements=[VehicleCatalogSource.slug],
            set_={
                "name": name,
                "homepage_url": homepage_url,
                "attribution": attribution,
                "publish_to_forms": publish_to_forms,
                "source_updated_at": source_updated_at,
                "last_error": None,
                "updated_at": func.now(),
            },
        )
        .returning(VehicleCatalogSource.id)
    )
    source_id = (await db.execute(source_stmt)).scalar_one()

    unique: dict[str, dict[str, Any]] = {}
    for row in rows:
        if payload := _catalog_payload(row, run_id):
            payload["source_id"] = source_id
            unique[payload["external_key"]] = payload
    payloads = list(unique.values())
    if not payloads:
        raise ValueError("Refusing to replace the active vehicle catalog with an empty snapshot")

    mutable_fields = (
        tuple(column for column in payloads[0] if column not in {"source_id", "external_key"})
        if payloads
        else ()
    )
    for offset in range(0, len(payloads), batch_size):
        batch = payloads[offset : offset + batch_size]
        statement = insert(VehicleCatalogItem).values(batch)
        await db.execute(
            statement.on_conflict_do_update(
                constraint="uq_catalog_items_source_key",
                set_={column: getattr(statement.excluded, column) for column in mutable_fields},
            )
        )

    await db.execute(
        update(VehicleCatalogItem)
        .where(
            VehicleCatalogItem.source_id == source_id,
            VehicleCatalogItem.sync_run_id != run_id,
            VehicleCatalogItem.active.is_(True),
        )
        .values(active=False)
    )
    await db.execute(
        update(VehicleCatalogSource)
        .where(VehicleCatalogSource.id == source_id)
        .values(
            item_count=len(payloads),
            last_success_at=datetime.now(tz=UTC),
            last_error=None,
            updated_at=func.now(),
        )
    )
    return len(payloads)
