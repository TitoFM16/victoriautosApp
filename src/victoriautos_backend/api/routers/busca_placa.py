import asyncio
from datetime import UTC, datetime
from typing import Any

import httpx
from fastapi import APIRouter, Request
from sqlalchemy import select

from victoriautos_backend.api.deps import CurrentUser, DbSession
from victoriautos_backend.core.config import settings
from victoriautos_backend.core.rate_limit import limiter
from victoriautos_backend.models.plate_search import PlateSearch
from victoriautos_backend.schemas.plate_search import (
    PlateSearchHistoryEntry,
    PlateSearchRequest,
    PlateSearchResult,
)

router = APIRouter(prefix="/api/buscaplaca", tags=["busca-placa"])


async def _fetch_with_retry(
    client: httpx.AsyncClient, url: str, payload: dict[str, Any]
) -> dict[str, Any]:
    """Retry an external lookup up to `plate_lookup_max_retries` times, same
    backoff-free retry loop as the original `fetchWithRetry` helper."""
    result: dict[str, Any] = {"error": "Failed after multiple attempts"}
    for _ in range(settings.plate_lookup_max_retries):
        try:
            response = await client.post(url, json=payload, timeout=15.0)
            data = response.json()
        except httpx.HTTPError:
            continue
        if "error" not in data:
            return data
        result = data
    return result


@router.post("/", response_model=PlateSearchResult)
@limiter.limit("10/minute")
async def search_plate(
    request: Request, payload: PlateSearchRequest, current_user: CurrentUser, db: DbSession
) -> PlateSearchResult:
    plate = payload.plate.upper()

    search = await db.scalar(
        select(PlateSearch).where(
            PlateSearch.plate == plate, PlateSearch.user_id == current_user.id
        )
    )
    if search is None:
        search = PlateSearch(plate=plate, user_id=current_user.id, retries=0)
        db.add(search)

    async with httpx.AsyncClient() as client:
        simit_result, fasecolda_result = await asyncio.gather(
            _fetch_with_retry(client, settings.simit_api_url, {"document_number": plate}),
            _fetch_with_retry(client, settings.fasecolda_api_url, {"placa": plate}),
        )

    search.simit_result = simit_result
    search.fasecolda_result = fasecolda_result
    search.date = datetime.now(UTC)
    search.retries += 1

    await db.commit()
    await db.refresh(search)

    return PlateSearchResult(
        plate=plate,
        simit_result=simit_result,
        fasecolda_result=fasecolda_result,
        date=search.date,
    )


@router.get("/history", response_model=list[PlateSearchHistoryEntry])
async def plate_search_history(current_user: CurrentUser, db: DbSession) -> list[PlateSearch]:
    result = await db.execute(
        select(PlateSearch)
        .where(PlateSearch.user_id == current_user.id)
        .order_by(PlateSearch.date.desc())
    )
    return list(result.scalars().all())
