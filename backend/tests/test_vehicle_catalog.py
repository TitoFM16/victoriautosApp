import uuid

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.models.vehicle_catalog import (
    VehicleCatalogEntry,
    VehicleCatalogItem,
    VehicleCatalogSource,
)


async def _seed_catalog(db_session: AsyncSession) -> None:
    db_session.add_all(
        [
            VehicleCatalogEntry(tipo="AUT", marca="TOYOTA", linea="COROLLA", version="XEI"),
            VehicleCatalogEntry(tipo="AUT", marca="TOYOTA", linea="YARIS", version="CORE"),
            VehicleCatalogEntry(tipo="AUT", marca="MAZDA", linea="3", version="TOURING"),
            VehicleCatalogEntry(tipo="SUV", marca="TOYOTA", linea="RAV4", version="LE"),
        ]
    )
    await db_session.commit()


async def test_cascading_lookup_no_params_lists_tipos(
    client: AsyncClient, db_session: AsyncSession
):
    await _seed_catalog(db_session)
    response = await client.get("/api/buscavehiculo/")
    assert response.status_code == 200
    tipos = {row["tipo"] for row in response.json()}
    assert tipos == {"AUT", "SUV"}


async def test_cascading_lookup_by_tipo_lists_marcas(client: AsyncClient, db_session: AsyncSession):
    await _seed_catalog(db_session)
    response = await client.get("/api/buscavehiculo/", params={"tipo": "AUT"})
    assert response.status_code == 200
    marcas = {row["marca"] for row in response.json()}
    assert marcas == {"TOYOTA", "MAZDA"}


async def test_cascading_lookup_tipo_all_lists_every_marca(
    client: AsyncClient, db_session: AsyncSession
):
    await _seed_catalog(db_session)
    response = await client.get("/api/buscavehiculo/", params={"tipo": "all"})
    marcas = {row["marca"] for row in response.json()}
    assert marcas == {"TOYOTA", "MAZDA"}


async def test_cascading_lookup_tipo_and_marca_lists_lineas(
    client: AsyncClient, db_session: AsyncSession
):
    await _seed_catalog(db_session)
    response = await client.get("/api/buscavehiculo/", params={"tipo": "AUT", "marca": "TOYOTA"})
    assert response.status_code == 200
    lineas = {row["linea"] for row in response.json()}
    assert lineas == {"COROLLA", "YARIS"}


async def test_add_marca_requires_admin(client: AsyncClient):
    response = await client.post("/api/buscavehiculo/marca", json={"tipo": "AUT", "marca": "FORD"})
    assert response.status_code == 401


async def test_add_marca_then_duplicate_is_noop(admin_client: AsyncClient):
    first = await admin_client.post(
        "/api/buscavehiculo/marca", json={"tipo": "AUT", "marca": "FORD"}
    )
    assert first.status_code == 201

    second = await admin_client.post(
        "/api/buscavehiculo/marca", json={"tipo": "AUT", "marca": "FORD"}
    )
    assert second.status_code == 200
    assert "already exists" in second.json()["message"]


async def test_add_linea(admin_client: AsyncClient):
    await admin_client.post("/api/buscavehiculo/marca", json={"tipo": "AUT", "marca": "FORD"})

    response = await admin_client.post(
        "/api/buscavehiculo/linea",
        json={"tipo": "AUT", "marca": "FORD", "linea": "FIESTA", "version": "SE"},
    )
    assert response.status_code == 201

    lookup = await admin_client.get("/api/buscavehiculo/", params={"tipo": "AUT", "marca": "FORD"})
    lineas = {row["linea"] for row in lookup.json()}
    assert "FIESTA" in lineas


async def test_refreshed_catalog_is_combined_with_legacy_entries(
    client: AsyncClient, db_session: AsyncSession
):
    await _seed_catalog(db_session)
    source = VehicleCatalogSource(
        slug="mintransporte",
        name="MinTransporte",
        homepage_url="https://mintransporte.gov.co/",
        publish_to_forms=True,
    )
    db_session.add(source)
    await db_session.flush()
    run_id = uuid.uuid4()
    db_session.add_all(
        [
            VehicleCatalogItem(
                source_id=source.id,
                external_key="active",
                source_dataset_id="2026:table",
                raw_vehicle_type="AUTOMOVIL",
                form_type="AUT",
                brand="RENAULT",
                line="DUSTER INTENS",
                model_year=2025,
                sync_run_id=run_id,
            ),
            VehicleCatalogItem(
                source_id=source.id,
                external_key="inactive",
                source_dataset_id="2025:table",
                raw_vehicle_type="AUTOMOVIL",
                form_type="AUT",
                brand="OLD BRAND",
                line="OLD LINE",
                model_year=2024,
                active=False,
                sync_run_id=run_id,
            ),
        ]
    )
    await db_session.commit()

    brands = await client.get("/api/buscavehiculo/", params={"tipo": "AUT"})
    assert {row["marca"] for row in brands.json()} == {"MAZDA", "RENAULT", "TOYOTA"}

    lines = await client.get("/api/buscavehiculo/", params={"tipo": "AUT", "marca": "RENAULT"})
    assert lines.json() == [{"linea": "DUSTER INTENS", "version": ""}]


async def test_model_year_lookup_uses_only_active_refreshed_rows(
    client: AsyncClient, db_session: AsyncSession
):
    source = VehicleCatalogSource(
        slug="mintransporte",
        name="MinTransporte",
        homepage_url="https://mintransporte.gov.co/",
        publish_to_forms=True,
    )
    db_session.add(source)
    await db_session.flush()
    run_id = uuid.uuid4()
    for year, active in ((2025, True), (2024, True), (2023, False)):
        db_session.add(
            VehicleCatalogItem(
                source_id=source.id,
                external_key=str(year),
                source_dataset_id="table",
                raw_vehicle_type="AUTOMOVIL",
                form_type="AUT",
                brand="MAZDA",
                line="3 TOURING",
                model_year=year,
                active=active,
                sync_run_id=run_id,
            )
        )
    await db_session.commit()

    response = await client.get(
        "/api/buscavehiculo/modelos",
        params={"tipo": "AUT", "marca": "MAZDA", "linea": "3 TOURING"},
    )
    assert response.status_code == 200
    assert response.json() == [{"modelo": 2025}, {"modelo": 2024}]
