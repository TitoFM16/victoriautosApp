import io

from httpx import AsyncClient
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.models.car import Car, CarStatus

CAR_FIELDS = {
    "tipo": "Automovil",
    "marca": "Toyota",
    "linea": "Corolla",
    "modelo": "2020",
    "km": "50000",
    "price": "80000000",
    "matricula": "Bogota",
    "color": "Rojo",
    "transmision": "Automatica",
    "combustible": "Gasolina",
    "cilindraje": "1800",
    "traccion": "Delantera",
    "direccion": "Hidraulica",
    "frenos": "ABS",
    "airbag": "Si",
    "placa": "ABC123",
    "status": "ALMACEN",
}


def _test_image_bytes() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buf, format="JPEG")
    return buf.getvalue()


async def _make_car(db_session: AsyncSession, **overrides) -> Car:
    fields = {
        "tipo": "Automovil",
        "marca": "Toyota",
        "linea": "Corolla",
        "modelo": 2020,
        "km": "50000",
        "price": "80000000",
        "matricula": "Bogota",
        "color": "Rojo",
        "transmision": "Automatica",
        "combustible": "Gasolina",
        "cilindraje": "1800",
        "traccion": "Delantera",
        "direccion": "Hidraulica",
        "frenos": "ABS",
        "airbag": "Si",
        "placa": "ABC123",
        "status": CarStatus.ALMACEN,
        "images": [],
        **overrides,
    }
    car = Car(**fields)
    db_session.add(car)
    await db_session.commit()
    await db_session.refresh(car)
    return car


async def test_list_cars_only_returns_almacen(client: AsyncClient, db_session: AsyncSession):
    await _make_car(db_session, placa="AAA111")
    await _make_car(db_session, placa="BBB222", status=CarStatus.VENDIDO)

    response = await client.get("/api/cars/")

    assert response.status_code == 200
    cars = response.json()
    assert len(cars) == 1
    assert "placa" not in cars[0]


async def test_get_car_hidden_returns_403(client: AsyncClient, db_session: AsyncSession):
    car = await _make_car(db_session, status=CarStatus.OCULTO)

    response = await client.get(f"/api/cars/{car.id}")

    assert response.status_code == 403


async def test_get_car_not_found(client: AsyncClient):
    response = await client.get("/api/cars/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


async def test_mobile_flag_trims_to_first_image(client: AsyncClient, db_session: AsyncSession):
    await _make_car(db_session, images=["0.webp", "1.webp", "2.webp"])

    response = await client.get("/api/cars/", params={"mobile": "true"})

    assert response.status_code == 200
    assert response.json()[0]["images"] == ["0.webp"]


async def test_admin_endpoints_require_auth(client: AsyncClient):
    response = await client.get("/api/admin/cars")
    assert response.status_code == 401


async def test_admin_endpoints_require_admin_flag(client: AsyncClient, db_session: AsyncSession):
    from victoriautos_backend.core.security import hash_password
    from victoriautos_backend.models.user import User

    user = User(username="regular", password_hash=hash_password("password123"), admin=False)
    db_session.add(user)
    await db_session.commit()

    await client.post("/api/users/login", json={"username": "regular", "password": "password123"})
    response = await client.get("/api/admin/cars")
    assert response.status_code == 403


async def test_admin_create_car_with_image_upload(admin_client: AsyncClient):
    files = {"car_images": ("test.jpg", _test_image_bytes(), "image/jpeg")}
    response = await admin_client.post("/api/admin/cars", data=CAR_FIELDS, files=files)

    assert response.status_code == 201
    body = response.json()
    assert body["placa"] == "ABC123"
    assert body["images"] == ["0.webp"]

    # Sensitive fields ARE present on the admin schema.
    assert "vin" in body

    image_response = await admin_client.get(f"/images/vehiculos/{body['id']}/0.webp")
    assert image_response.status_code == 200
    assert image_response.headers["content-type"] == "image/webp"


async def test_admin_update_car_whitelist(admin_client: AsyncClient, db_session: AsyncSession):
    car = await _make_car(db_session)

    response = await admin_client.put(f"/api/admin/cars/{car.id}", json={"price": "90000000"})

    assert response.status_code == 200
    assert response.json()["price"] == "90000000.00"


async def test_admin_delete_car_removes_image_folder(admin_client: AsyncClient):
    files = {"car_images": ("test.jpg", _test_image_bytes(), "image/jpeg")}
    create_response = await admin_client.post("/api/admin/cars", data=CAR_FIELDS, files=files)
    car_id = create_response.json()["id"]

    delete_response = await admin_client.delete(f"/api/admin/cars/{car_id}")
    assert delete_response.status_code == 200

    image_response = await admin_client.get(f"/images/vehiculos/{car_id}/0.webp")
    assert image_response.status_code == 404


async def test_ofertas_images_require_admin(client: AsyncClient):
    response = await client.get("/images/ofertas/some-id/0.webp")
    assert response.status_code == 401
