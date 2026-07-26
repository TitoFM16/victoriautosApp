import io

from httpx import AsyncClient
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.models.car import Car, CarStatus


def _test_image_bytes() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), color="blue").save(buf, format="JPEG")
    return buf.getvalue()


async def test_compra_create_requires_recaptcha(client: AsyncClient):
    response = await client.post(
        "/api/compra/",
        json={
            "nombre": "Juan",
            "apellido": "Perez",
            "celular": "3001234567",
            "email": "juan@example.com",
            "cedula": "123456789",
            "recaptcha_token": "",
        },
    )
    assert response.status_code == 400


async def test_compra_create_and_admin_only_listing(
    client: AsyncClient, admin_client: AsyncClient, bypass_recaptcha: None
):
    create_response = await client.post(
        "/api/compra/",
        json={
            "nombre": "Juan",
            "apellido": "Perez",
            "celular": "3001234567",
            "email": "juan@example.com",
            "cedula": "123456789",
            "recaptcha_token": "any-token",
        },
    )
    assert create_response.status_code == 201

    # No auth at all -> the original leaked buyer PII here; must now be blocked.
    unauth_response = await client.get("/api/compra/")
    assert unauth_response.status_code == 401

    admin_response = await admin_client.get("/api/compra/")
    assert admin_response.status_code == 200
    assert len(admin_response.json()) == 1
    assert admin_response.json()[0]["cedula"] == "123456789"


async def test_interes_create_and_admin_crud(
    client: AsyncClient, admin_client: AsyncClient, bypass_recaptcha: None
):
    create_response = await client.post(
        "/api/interescompra/",
        json={
            "nombre": "Maria",
            "apellido": "Gomez",
            "celular": "3009876543",
            "marca": "Chevrolet",
            "linea": "Aveo",
            "modelo": 2018,
            "km": "0-50000",
            "price": "40-50 millones",
            "recaptcha_token": "any-token",
        },
    )
    assert create_response.status_code == 201
    interes_id = create_response.json()["id"]

    admin_get = await admin_client.get(f"/api/interescompra/{interes_id}")
    assert admin_get.status_code == 200
    assert admin_get.json()["status"] == "PENDING"

    update_response = await admin_client.put(
        f"/api/interescompra/{interes_id}", json={"status": "CONTACTADO"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "CONTACTADO"

    delete_response = await admin_client.delete(f"/api/interescompra/{interes_id}")
    assert delete_response.status_code == 200


async def test_ofertas_create_with_images(
    client: AsyncClient, admin_client: AsyncClient, bypass_recaptcha: None
):
    form_data = {
        "nombre": "Pedro",
        "apellido": "Ramirez",
        "celular": "3005551234",
        "email": "pedro@example.com",
        "marca": "Mazda",
        "linea": "3",
        "modelo": "2019",
        "km": "60000",
        "matricula": "Cali",
        "price": "50000000",
        "recaptcha_token": "any-token",
    }
    files = {"car_images": ("offer.jpg", _test_image_bytes(), "image/jpeg")}

    create_response = await client.post("/api/ofertas/", data=form_data, files=files)
    assert create_response.status_code == 201
    body = create_response.json()
    assert body["images"] == ["0.webp"]

    image_response = await admin_client.get(f"/images/ofertas/{body['id']}/0.webp")
    assert image_response.status_code == 200

    delete_response = await admin_client.delete(f"/api/ofertas/{body['id']}")
    assert delete_response.status_code == 200

    image_after_delete = await admin_client.get(f"/images/ofertas/{body['id']}/0.webp")
    assert image_after_delete.status_code == 404


async def test_vende_create_no_recaptcha_needed(client: AsyncClient, admin_client: AsyncClient):
    response = await client.post(
        "/api/vende/",
        json={
            "nombre": "Sofia",
            "apellido": "Diaz",
            "celular": "3011112222",
            "email": "sofia@example.com",
            "marca": "Renault",
            "linea": "Logan",
            "modelo": 2015,
            "km": "90000",
            "matricula": "Medellin",
            "price": "30000000",
        },
    )
    assert response.status_code == 201
    assert response.json()["images"] == []

    listing = await admin_client.get("/api/vende/")
    assert listing.status_code == 200
    assert len(listing.json()) == 1


async def test_admin_match_leads(
    admin_client: AsyncClient, db_session: AsyncSession, bypass_recaptcha: None
):
    db_session.add(
        Car(
            tipo="Automovil",
            marca="Toyota",
            linea="Corolla",
            modelo=2020,
            km="10000",
            price="90000000",
            matricula="Bogota",
            color="Azul",
            transmision="Automatica",
            combustible="Gasolina",
            cilindraje="1800",
            traccion="Delantera",
            direccion="Hidraulica",
            frenos="ABS",
            airbag="Si",
            placa="XYZ999",
            status=CarStatus.ALMACEN,
            images=[],
        )
    )
    await db_session.commit()

    interes_response = await admin_client.post(
        "/api/interescompra/",
        json={
            "nombre": "Lucia",
            "apellido": "Torres",
            "celular": "3022223333",
            "marca": "Toyota",
            "linea": "Corolla",
            "modelo": 2020,
            "km": "0-20000",
            "price": "80-90 millones",
            "recaptcha_token": "bypassed",
        },
    )
    assert interes_response.status_code == 201

    response = await admin_client.get("/api/admin/match")
    assert response.status_code == 200
    body = response.json()
    assert len(body["cars_match"]) == 1
    assert body["cars_match"][0]["car"]["marca"] == "Toyota"
    assert body["cars_match_oferta"] == []
