from fastapi import APIRouter, Request, status
from sqlalchemy import select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.core.rate_limit import limiter
from victoriautos_backend.models.oferta_form import OfertaForm
from victoriautos_backend.schemas.oferta_form import OfertaFormPublic
from victoriautos_backend.schemas.vende_form import VendeFormCreate

router = APIRouter(prefix="/api/vende", tags=["vende"])


@router.get("/", response_model=list[OfertaFormPublic])
async def list_vende_submissions(db: DbSession, _admin: AdminUser) -> list[OfertaForm]:
    result = await db.execute(select(OfertaForm))
    return list(result.scalars().all())


@router.post("/", response_model=OfertaFormPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_vende_submission(
    request: Request, payload: VendeFormCreate, db: DbSession
) -> OfertaForm:
    oferta = OfertaForm(**payload.model_dump(), images=[])
    db.add(oferta)
    await db.commit()
    await db.refresh(oferta)
    return oferta
