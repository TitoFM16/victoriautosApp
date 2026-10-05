import hashlib
import json
import logging
import runpy
from datetime import UTC, date, datetime
from decimal import Decimal
from pathlib import Path
from uuid import UUID

import pytest
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from victoriautos_backend.core.security import hash_password, verify_password
from victoriautos_backend.models.car import Car, CarStatus
from victoriautos_backend.models.compra_form import CompraForm
from victoriautos_backend.models.interes_form import InteresForm
from victoriautos_backend.models.oferta_form import OfertaForm
from victoriautos_backend.models.plate_search import PlateSearch
from victoriautos_backend.models.tramite import Tramite
from victoriautos_backend.models.user import User

script = runpy.run_path(
    str(Path(__file__).resolve().parents[1] / "scripts/migrate_legacy_mongo.py")
)
import_exports = script["import_exports"]
decode_ejson = script["decode_ejson"]
legacy_id = script["legacy_id"]

CAR_OID = "650000000000000000000001"
USER_OID = "650000000000000000000002"
OFFER_OID = "650000000000000000000003"
INTERES_OID = "650000000000000000000004"
COMPRA_OID = "650000000000000000000005"
TRAMITE_OID = "650000000000000000000006"
PLATE_OID = "650000000000000000000007"
CAR_ID = UUID("1c849a94-49d4-407b-886c-ad6bd95c09a8")
OFFER_ID = UUID("9ab345ec-4bb8-4f97-b81d-5759e3673e1d")
WHEN = datetime(2023, 9, 12, 6, 0, tzinfo=UTC)
PASSWORD = "contraseña de prueba 🔑"


@pytest.fixture
def legacy_credentials():
    salt = "a1" * 32
    digest = hashlib.pbkdf2_hmac("sha256", PASSWORD.encode(), salt.encode(), 25000, 512).hex()
    return salt, digest, f"legacy-pbkdf2-sha256$25000${salt}${digest}"


def write_export(directory, collection, rows):
    (directory / f"{collection}.json").write_text(json.dumps(rows))


@pytest.fixture
def exports(tmp_path, legacy_credentials):
    salt, digest, _ = legacy_credentials
    timestamps = {
        "createdAt": {"$date": WHEN.isoformat()},
        "updatedAt": {"$date": WHEN.isoformat()},
    }
    contact = {
        "nombre": "Test",
        "apellido": "Person",
        "celular": {"$numberLong": "3001234567"},
        "email": "test@example.invalid",
        "wppCheck": True,
        "status": "FINALIZADO",
        **timestamps,
    }
    vehicle = {
        "marca": "Test",
        "linea": "Test line",
        "modelo": {"$numberInt": "2020"},
        "km": 12345,
        "matricula": "Bogotá",
        "price": "50-100 millones",
    }
    write_export(
        tmp_path,
        "cars",
        [
            {
                "_id": {"$oid": CAR_OID},
                "uuid": str(CAR_ID),
                "Tipo": "Automovil",
                **vehicle,
                "price": {"$numberDecimal": "60000000.25"},
                "color": "Rojo",
                "transmision": "Manual",
                "combustible": "Gasolina",
                "cilindraje": 1600,
                "traccion": "4x2",
                "direccion": "Asistida",
                "frenos": "ABS",
                "airbag": "2",
                "placa": "TEST01",
                "vin": "test-vin",
                "chasis_no": "test-chasis",
                "motor_no": "test-motor",
                "importacion_no": "test-import",
                "importacion_date": {"$date": "2020-01-02T00:00:00Z"},
                "status": "VENDIDO",
                "consignacion": True,
                "featured": True,
                "images": ["0.webp", "1.webp"],
                **timestamps,
            }
        ],
    )
    write_export(
        tmp_path,
        "users",
        [
            {
                "_id": {"$oid": USER_OID},
                "username": "legacy-admin",
                "firstname": "Test",
                "lastname": "Admin",
                "role": "owner",
                "admin": True,
                "salt": salt,
                "hash": digest,
                **timestamps,
            }
        ],
    )
    write_export(
        tmp_path,
        "ofertas_forms",
        [
            {
                "_id": {"$oid": OFFER_OID},
                "uuid": str(OFFER_ID),
                **contact,
                **vehicle,
                "images": ["0.webp"],
            }
        ],
    )
    write_export(tmp_path, "interes_forms", [{"_id": {"$oid": INTERES_OID}, **contact, **vehicle}])
    write_export(
        tmp_path,
        "compra_forms",
        [
            {
                "_id": {"$oid": COMPRA_OID},
                **contact,
                "cedula": {"$numberDouble": "123456789.0"},
                "car": {"$oid": CAR_OID},
            }
        ],
    )
    write_export(
        tmp_path,
        "tramites",
        [
            {
                "_id": {"$oid": TRAMITE_OID},
                "car": {"$oid": CAR_OID},
                "tramitador": "Test",
                "celular": 3001234567,
                "fechaInicio": {"$date": WHEN.isoformat()},
                "FechaFin": {"$date": {"$numberLong": "1704067200000"}},
                "estado": "en proceso",
                "documentos": ["documento"],
                "observaciones": ["observacion"],
                "precio": 120000,
                **timestamps,
            }
        ],
    )
    write_export(
        tmp_path,
        "platesearches",
        [
            {
                "_id": {"$oid": PLATE_OID},
                "user": {"$oid": USER_OID},
                "plate": "TEST01",
                "simitResult": {"items": [{"amount": {"$numberInt": "10"}}]},
                "fasecoldaResult": {"value": 123.25, "ok": True},
                "retries": {"$numberInt": "2"},
                "date": {"$date": WHEN.isoformat()},
            }
        ],
    )
    return tmp_path


def test_ejson_relaxed_and_canonical():
    parsed = json.loads(
        json.dumps(
            {
                "id": {"$oid": CAR_OID},
                "relaxed": {"$date": "2024-01-01T00:00:00Z"},
                "canonical": {"$date": {"$numberLong": "1704067200000"}},
                "values": [
                    {"$numberInt": "4"},
                    {"$numberLong": "9007199254740993"},
                    {"$numberDouble": "3.5"},
                    {"$numberDecimal": "12345678901234567890.25"},
                ],
                "ordinary": {"nested": [True, None, "hello"]},
            }
        ),
        object_hook=decode_ejson,
    )
    assert parsed["id"] == CAR_OID
    assert parsed["relaxed"] == parsed["canonical"] == datetime(2024, 1, 1, tzinfo=UTC)
    assert parsed["values"] == [4, 9007199254740993, 3.5, Decimal("12345678901234567890.25")]
    assert parsed["ordinary"] == {"nested": [True, None, "hello"]}


async def test_import_all_fields_and_references(db_session, exports):
    report = await import_exports(db_session, exports)
    assert all(count.inserted == 1 and count.warnings == 0 for count in report.values())
    car = await db_session.get(Car, CAR_ID)
    assert car.tipo == "Automovil"
    assert car.modelo == 2020 and car.km == "12345" and car.cilindraje == "1600"
    assert car.price == Decimal("60000000.25")
    assert car.status == CarStatus.VENDIDO
    assert car.images == ["0.webp", "1.webp"]
    assert car.consignacion and car.featured
    assert (car.placa, car.vin, car.chasis_no, car.motor_no, car.importacion_no) == (
        "TEST01",
        "test-vin",
        "test-chasis",
        "test-motor",
        "test-import",
    )
    assert car.importacion_date == date(2020, 1, 2)
    assert car.created_at == car.updated_at == WHEN
    for model, row_id in (
        (CompraForm, legacy_id(COMPRA_OID)),
        (InteresForm, legacy_id(INTERES_OID)),
        (OfertaForm, OFFER_ID),
    ):
        form = await db_session.get(model, row_id)
        assert form.celular == "3001234567" and form.wpp_check
        assert form.status == "FINALIZADO" and form.created_at == form.updated_at == WHEN
    compra = await db_session.get(CompraForm, legacy_id(COMPRA_OID))
    assert compra.car_id == CAR_ID and compra.cedula == "123456789"
    offer = await db_session.get(OfertaForm, OFFER_ID)
    assert offer.images == ["0.webp"] and offer.price == "50-100 millones"
    interest = await db_session.get(InteresForm, legacy_id(INTERES_OID))
    assert interest.price == "50-100 millones"
    tramite = await db_session.get(Tramite, legacy_id(TRAMITE_OID))
    assert tramite.car_id == CAR_ID and tramite.fecha_inicio == WHEN
    assert tramite.fecha_fin == datetime(2024, 1, 1, tzinfo=UTC)
    assert tramite.documentos == ["documento"] and tramite.observaciones == ["observacion"]
    assert tramite.precio == Decimal("120000") and tramite.estado == "en proceso"
    plate = await db_session.get(PlateSearch, legacy_id(PLATE_OID))
    assert plate.user_id == legacy_id(USER_OID) and plate.date == WHEN and plate.retries == 2
    assert plate.simit_result == {"items": [{"amount": 10}]}
    assert plate.fasecolda_result == {"value": 123.25, "ok": True}
    user = await db_session.get(User, legacy_id(USER_OID))
    assert (
        user.admin
        and user.role == "owner"
        and user.firstname == "Test"
        and user.lastname == "Admin"
    )
    assert verify_password(PASSWORD, user.password_hash)


async def test_idempotent_and_does_not_restore_old_password(db_session, exports):
    await import_exports(db_session, exports)
    user = await db_session.get(User, legacy_id(USER_OID))
    upgraded = hash_password(PASSWORD)
    user.password_hash = upgraded
    await db_session.commit()
    report = await import_exports(db_session, exports)
    assert all(count.inserted == 0 and count.skipped == 1 for count in report.values())
    for model in script["COLLECTIONS"].values():
        assert await db_session.scalar(select(func.count()).select_from(model)) == 1
    await db_session.refresh(user)
    assert user.password_hash == upgraded


async def test_dry_run_rolls_back_all_collections(db_session, exports, caplog):
    caplog.set_level(logging.INFO)
    report = await import_exports(db_session, exports, dry_run=True)
    assert all(count.inserted == 1 for count in report.values())
    assert "DRY RUN: rolled back" in caplog.text
    for model in script["COLLECTIONS"].values():
        assert await db_session.scalar(select(func.count()).select_from(model)) == 0
    await db_session.rollback()
    real = await import_exports(db_session, exports)
    assert all(count.inserted == 1 for count in real.values())


async def test_late_failure_rolls_back(db_session, exports):
    records = json.loads((exports / "platesearches.json").read_text())
    records[0]["user"] = {"$oid": "650000000000000000000099"}
    write_export(exports, "platesearches", records)
    with pytest.raises(ValueError, match="platesearches"):
        await import_exports(db_session, exports)
    assert await db_session.scalar(select(func.count()).select_from(Car)) == 0
    assert await db_session.scalar(select(func.count()).select_from(User)) == 0


async def test_username_collision_aborts_without_overwriting(db_session, exports):
    user = User(username="legacy-admin", password_hash=hash_password("existing"), admin=False)
    db_session.add(user)
    await db_session.commit()
    user_id = user.id
    with pytest.raises(IntegrityError):
        await import_exports(db_session, exports)
    assert await db_session.scalar(select(func.count()).select_from(Car)) == 0
    existing = await db_session.get(User, user_id)
    assert not existing.admin and verify_password("existing", existing.password_hash)


async def test_fallback_ids_unknown_status_unresolved_car_and_images(db_session, exports, caplog):
    caplog.set_level(logging.INFO)
    cars = json.loads((exports / "cars.json").read_text())
    cars[0]["uuid"] = "old-folder"
    cars[0]["status"] = "unexpected"
    write_export(exports, "cars", cars)
    offers = json.loads((exports / "ofertas_forms.json").read_text())
    offers[0].pop("uuid")
    write_export(exports, "ofertas_forms", offers)
    compras = json.loads((exports / "compra_forms.json").read_text())
    compras[0]["car"] = {"$oid": "650000000000000000000099"}
    write_export(exports, "compra_forms", compras)
    images_root = exports / "images"
    folder = images_root / "vehiculos/old-folder"
    folder.mkdir(parents=True)
    (folder / "0.webp").write_bytes(b"test")
    report = await import_exports(db_session, exports, images_root=images_root)
    car = await db_session.get(Car, legacy_id(CAR_OID))
    assert car.status == CarStatus.OCULTO
    assert (await db_session.get(OfertaForm, legacy_id(OFFER_OID))).images == ["0.webp"]
    assert (await db_session.get(Tramite, legacy_id(TRAMITE_OID))).car_id == car.id
    assert (await db_session.get(CompraForm, legacy_id(COMPRA_OID))).car_id is None
    assert report["cars"].warnings == 3  # uuid, status, one missing file
    assert report["ofertas_forms"].warnings == 3  # uuid, directory, file
    assert report["compra_forms"].warnings == 1
    assert "image folder must be renamed" in caplog.text
    assert "Missing/unsafe image file: vehiculos/old-folder/1.webp" in caplog.text
    assert (folder / "0.webp").read_bytes() == b"test"
    assert not (images_root / "vehiculos" / str(car.id)).exists()


async def test_missing_collections_are_logged(db_session, tmp_path, caplog):
    caplog.set_level(logging.INFO)
    report = await import_exports(db_session, tmp_path)
    assert all(count.inserted == count.skipped == 0 for count in report.values())
    assert caplog.text.count("missing collection file; skipping") == 7


@pytest.mark.parametrize("contents", ["{}", "[null]", '[{"_id": "bad"}]'])
async def test_malformed_exports_are_rejected(db_session, tmp_path, contents):
    (tmp_path / "cars.json").write_text(contents)
    with pytest.raises(ValueError, match="cars: invalid export"):
        await import_exports(db_session, tmp_path)


def test_legacy_password_verification(legacy_credentials):
    salt, _, encoded = legacy_credentials
    assert verify_password(PASSWORD, encoded)
    assert not verify_password("wrong password", encoded)
    # Decoding the salt hex to bytes is incompatible with the Node plugin.
    wrong_digest = hashlib.pbkdf2_hmac("sha256", PASSWORD.encode(), bytes.fromhex(salt), 25000, 512)
    assert not verify_password(PASSWORD, f"legacy-pbkdf2-sha256$25000${salt}${wrong_digest.hex()}")


@pytest.mark.parametrize(
    "suffix", ["", "25000", "25000$xx$yy", "999999999$a$b", "25000$" + "ab" * 32 + "$" + "ff" * 511]
)
def test_malformed_legacy_hash_fails_closed(suffix):
    assert not verify_password(PASSWORD, "legacy-pbkdf2-sha256$" + suffix)


async def test_imported_admin_login_rehashes_only_on_success(
    db_session, client, exports, legacy_credentials
):
    await import_exports(db_session, exports)
    bad = await client.post(
        "/api/users/login", json={"username": "legacy-admin", "password": "wrong"}
    )
    assert bad.status_code == 401 and "token" not in bad.cookies
    user = await db_session.get(User, legacy_id(USER_OID))
    assert user.password_hash == legacy_credentials[2]
    response = await client.post(
        "/api/users/login", json={"username": "legacy-admin", "password": PASSWORD}
    )
    assert response.status_code == 200 and "token" in response.cookies
    assert response.json()["user"] == {"id": str(user.id), "username": "legacy-admin"}
    await db_session.refresh(user)
    upgraded = user.password_hash
    assert upgraded.startswith("$argon2id$") and verify_password(PASSWORD, upgraded)
    assert (await client.get("/api/admin/cars")).status_code == 200
    assert "password_hash" not in response.text and "salt" not in response.text
    again = await client.post(
        "/api/users/login", json={"username": "legacy-admin", "password": PASSWORD}
    )
    assert again.status_code == 200
    await db_session.refresh(user)
    assert user.password_hash == upgraded
