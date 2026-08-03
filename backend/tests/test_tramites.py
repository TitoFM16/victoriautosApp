from httpx import AsyncClient


async def test_tramites_list_requires_auth(client: AsyncClient):
    """The original had no auth check on these GET routes at all - fixed here."""
    response = await client.get("/api/tramites/")
    assert response.status_code == 401


async def test_tramites_get_by_id_requires_auth(client: AsyncClient):
    response = await client.get("/api/tramites/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 401


async def test_tramites_crud(admin_client: AsyncClient):
    create_response = await admin_client.post(
        "/api/tramites/",
        json={"tramitador": "Ana", "celular": "3014445566", "estado": "en proceso"},
    )
    assert create_response.status_code == 201
    tramite_id = create_response.json()["id"]

    get_response = await admin_client.get(f"/api/tramites/{tramite_id}")
    assert get_response.status_code == 200
    assert get_response.json()["tramitador"] == "Ana"

    update_response = await admin_client.put(
        f"/api/tramites/{tramite_id}", json={"estado": "finalizado"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["estado"] == "finalizado"

    delete_response = await admin_client.delete(f"/api/tramites/{tramite_id}")
    assert delete_response.status_code == 200

    missing_response = await admin_client.get(f"/api/tramites/{tramite_id}")
    assert missing_response.status_code == 404


async def test_tramites_delete_all(admin_client: AsyncClient):
    await admin_client.post("/api/tramites/", json={"tramitador": "Ana", "celular": "1"})
    await admin_client.post("/api/tramites/", json={"tramitador": "Beto", "celular": "2"})

    response = await admin_client.delete("/api/tramites/")
    assert response.status_code == 200
    assert response.json()["deleted"] == 2

    listing = await admin_client.get("/api/tramites/")
    assert listing.json() == []
