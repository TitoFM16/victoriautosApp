import respx
from httpx import AsyncClient, Response

from victoriautos_backend.core.config import settings


async def test_search_plate_requires_auth(client: AsyncClient):
    response = await client.post("/api/buscaplaca/", json={"plate": "abc123"})
    assert response.status_code == 401


@respx.mock
async def test_search_plate_upserts_and_uppercases(admin_client: AsyncClient):
    respx.post(settings.simit_api_url).mock(return_value=Response(200, json={"comparendos": []}))
    respx.post(settings.fasecolda_api_url).mock(
        return_value=Response(200, json={"valor": 45000000})
    )

    response = await admin_client.post("/api/buscaplaca/", json={"plate": "abc123"})

    assert response.status_code == 200
    body = response.json()
    assert body["plate"] == "ABC123"
    assert body["simit_result"] == {"comparendos": []}
    assert body["fasecolda_result"] == {"valor": 45000000}

    history_response = await admin_client.get("/api/buscaplaca/history")
    assert history_response.status_code == 200
    assert len(history_response.json()) == 1
    assert history_response.json()[0]["retries"] == 1


@respx.mock
async def test_search_plate_retries_on_error_payload(admin_client: AsyncClient):
    settings_max_retries = settings.plate_lookup_max_retries
    route = respx.post(settings.simit_api_url)
    route.side_effect = [
        Response(200, json={"error": "not found yet"}),
        Response(200, json={"comparendos": []}),
    ] + [Response(200, json={"comparendos": []})] * (settings_max_retries - 2)
    respx.post(settings.fasecolda_api_url).mock(return_value=Response(200, json={"valor": 1}))

    response = await admin_client.post("/api/buscaplaca/", json={"plate": "xyz999"})

    assert response.status_code == 200
    assert response.json()["simit_result"] == {"comparendos": []}
