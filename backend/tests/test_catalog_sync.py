import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.models.vehicle_catalog import VehicleCatalogItem, VehicleCatalogSource
from victoriautos_backend.services.catalog_sync import form_vehicle_type, sync_catalog_rows


def test_maps_official_classes_to_existing_form_codes() -> None:
    assert form_vehicle_type("Automovil") == "AUT"
    assert form_vehicle_type("Carro") == "AUT"
    assert form_vehicle_type("Camionetas y Camperos") == "CAM"
    assert form_vehicle_type("Motocicleta eléctrica") == "MOTO"
    assert form_vehicle_type("DobleCabina") == "PU"
    assert form_vehicle_type("Automovil", "Tabla 9 Híbridos") == "HE"
    assert form_vehicle_type("Tractocamion") is None


async def test_sync_upserts_snapshot_and_retires_missing_rows(db_session: AsyncSession) -> None:
    source_kwargs = {
        "slug": "test-source",
        "name": "Test source",
        "homepage_url": "https://example.test/catalog",
        "source_updated_at": "2026-08-03",
    }
    rows = [
        {
            "source_dataset_id": "table-1",
            "source_record_id": "1",
            "vehicle_type": "AUTOMOVIL",
            "brand": "Mazda",
            "line": "3 Touring",
            "model_year": 2025,
            "engine_cc": "1998",
            "market_value_cop": "85000000",
        },
        {
            "source_dataset_id": "table-1",
            "source_record_id": "2",
            "vehicle_type": "AUTOMOVIL",
            "brand": "Renault",
            "line": "Duster",
            "model_year": 2025,
        },
    ]

    assert await sync_catalog_rows(db_session, rows, **source_kwargs) == 2
    await db_session.commit()

    changed_rows = [{**rows[0], "market_value_cop": "86000000"}]
    assert await sync_catalog_rows(db_session, changed_rows, **source_kwargs) == 1
    await db_session.commit()

    source = await db_session.scalar(
        select(VehicleCatalogSource).where(VehicleCatalogSource.slug == "test-source")
    )
    assert source is not None
    assert source.item_count == 1
    items = (await db_session.execute(select(VehicleCatalogItem))).scalars().all()
    assert len(items) == 2
    active = next(item for item in items if item.active)
    inactive = next(item for item in items if not item.active)
    assert active.brand == "MAZDA"
    assert int(active.market_value_cop or 0) == 86_000_000
    assert inactive.brand == "RENAULT"


async def test_sync_rejects_empty_snapshot(db_session: AsyncSession) -> None:
    with pytest.raises(ValueError, match="empty snapshot"):
        await sync_catalog_rows(
            db_session,
            [],
            slug="empty",
            name="Empty",
            homepage_url="https://example.test/empty",
        )


async def test_sync_rejects_placeholder_brand_and_line_rows(db_session: AsyncSession) -> None:
    rows = [
        {"brand": "SIN INFORMACIÓN", "line": "DUSTER", "model_year": 2025},
        {"brand": "RENAULT", "line": "SIN LINEA", "model_year": 2025},
    ]
    with pytest.raises(ValueError, match="empty snapshot"):
        await sync_catalog_rows(
            db_session,
            rows,
            slug="placeholders",
            name="Placeholders",
            homepage_url="https://example.test/placeholders",
        )
