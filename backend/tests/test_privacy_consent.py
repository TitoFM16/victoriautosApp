from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.models.compra_form import CompraForm
from victoriautos_backend.models.interes_form import InteresForm
from victoriautos_backend.models.oferta_form import OfertaForm

LEAD = {"nombre": "Ana", "apellido": "Rojas", "celular": "3001234567"}
VEHICLE = {"marca": "Mazda", "linea": "3", "modelo": 2018, "km": "50000", "price": "60000000"}

# endpoint, JSON body without consent, model, multipart?
CASES = [
    (
        "/api/compra/",
        {**LEAD, "email": "ana@example.com", "cedula": "123456", "recaptcha_token": "t"},
        CompraForm,
        False,
    ),
    ("/api/interescompra/", {**LEAD, **VEHICLE, "recaptcha_token": "t"}, InteresForm, False),
    (
        "/api/vende/",
        {**LEAD, **VEHICLE, "email": "ana@example.com", "matricula": "Pasto"},
        OfertaForm,
        False,
    ),
    (
        "/api/ofertas/",
        {
            **LEAD,
            **VEHICLE,
            "email": "ana@example.com",
            "matricula": "Pasto",
            "recaptcha_token": "t",
        },
        OfertaForm,
        True,
    ),
]


async def _post(client: AsyncClient, endpoint: str, body: dict, multipart: bool, consent):
    if consent is not None:
        body = {**body, "privacy_accepted": consent}
    if multipart:
        return await client.post(
            endpoint,
            data={k: str(v).lower() if isinstance(v, bool) else str(v) for k, v in body.items()},
        )
    return await client.post(endpoint, json=body)


@pytest.mark.parametrize(("endpoint", "body", "model", "multipart"), CASES)
@pytest.mark.parametrize("consent", [None, False])
async def test_lead_forms_reject_missing_consent(
    client: AsyncClient,
    db_session: AsyncSession,
    bypass_recaptcha: None,
    endpoint,
    body,
    model,
    multipart,
    consent,
):
    response = await _post(client, endpoint, body, multipart, consent)

    assert response.status_code == 422
    if consent is False:
        assert "política de tratamiento de datos" in response.text
    assert await db_session.scalar(select(func.count()).select_from(model)) == 0


@pytest.mark.parametrize(("endpoint", "body", "model", "multipart"), CASES)
async def test_lead_forms_record_server_side_consent_time(
    client: AsyncClient,
    db_session: AsyncSession,
    bypass_recaptcha: None,
    endpoint,
    body,
    model,
    multipart,
):
    before = datetime.now(UTC)
    response = await _post(client, endpoint, body, multipart, True)
    after = datetime.now(UTC)

    assert response.status_code == 201
    accepted_at = datetime.fromisoformat(response.json()["privacy_accepted_at"])
    assert before - timedelta(seconds=1) <= accepted_at <= after + timedelta(seconds=1)
    stored = await db_session.scalar(select(model.privacy_accepted_at))
    assert stored == accepted_at
