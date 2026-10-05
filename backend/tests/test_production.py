from pathlib import Path

import anyio
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from victoriautos_backend.core.config import settings
from victoriautos_backend.db.session import get_db
from victoriautos_backend.main import create_app


@pytest.mark.parametrize("environment, expected", [("production", 404), ("development", 200)])
async def test_documentation_visibility(monkeypatch, environment, expected):
    monkeypatch.setattr(settings, "environment", environment)
    async with AsyncClient(
        transport=ASGITransport(app=create_app()), base_url="http://test"
    ) as client:
        for path in ("/docs", "/redoc", "/openapi.json"):
            assert (await client.get(path)).status_code == expected


async def test_health_checks_database(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    response = await client.get("/api/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_health_unavailable():
    # Real SQLAlchemy session and connection failure; no mocked ORM behavior.
    engine = create_async_engine(
        "postgresql+asyncpg://unused:unused@127.0.0.1:1/unavailable",
        connect_args={"timeout": 1},
    )
    sessions = async_sessionmaker(engine)

    async def unavailable_db():
        async with sessions() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = unavailable_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/health")
            assert response.status_code == 503
            assert response.json() == {"detail": "Database unavailable"}
            assert (await client.get("/api/")).status_code == 200
    finally:
        await engine.dispose()


@pytest.mark.parametrize("endpoint", ["/api/admin/cars", "/api/ofertas/"])
@pytest.mark.parametrize("boundary", ["count", "size", "accepted"])
async def test_upload_limits(
    admin_client, bypass_recaptcha, monkeypatch, tmp_path: Path, endpoint, boundary
):
    from test_cars import CAR_FIELDS, _test_image_bytes

    monkeypatch.setattr(settings, "images_dir", tmp_path)
    image = _test_image_bytes()
    monkeypatch.setattr(settings, "max_upload_size_bytes", len(image))
    fields = (
        CAR_FIELDS
        if endpoint == "/api/admin/cars"
        else {
            "nombre": "Test",
            "apellido": "Upload",
            "celular": "3001234567",
            "email": "test@example.com",
            "marca": "Toyota",
            "linea": "Corolla",
            "modelo": "2020",
            "km": "100",
            "matricula": "Bogota",
            "price": "50000000",
            "recaptcha_token": "bypassed",
        }
    )
    count = settings.max_upload_files + (boundary == "count")
    files = [("car_images", (f"{i}.jpg", image, "image/jpeg")) for i in range(count)]
    if boundary == "size":
        # Fail after a valid file to also verify partial output cleanup.
        files[-1] = ("car_images", ("large.jpg", image + b"x", "image/jpeg"))
    response = await admin_client.post(endpoint, data=fields, files=files)
    if boundary == "accepted":
        assert response.status_code == 201
        assert len(response.json()["images"]) == settings.max_upload_files
    else:
        assert response.status_code == 413
        assert not [path async for path in anyio.Path(tmp_path).rglob("*.webp")]
