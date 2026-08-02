import uuid

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.core.rate_limit import limiter
from victoriautos_backend.models.interes_form import InteresForm
from victoriautos_backend.schemas.interes_form import (
    InteresFormCreate,
    InteresFormPublic,
    InteresFormUpdate,
)
from victoriautos_backend.services.recaptcha import verify_recaptcha_token

router = APIRouter(prefix="/api/interescompra", tags=["interes"])


@router.get("/", response_model=list[InteresFormPublic])
async def list_pending_interes_forms(db: DbSession, _admin: AdminUser) -> list[InteresForm]:
    result = await db.execute(select(InteresForm).where(InteresForm.status == "PENDING"))
    return list(result.scalars().all())


@router.post("/", response_model=InteresFormPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_interes_form(
    request: Request, payload: InteresFormCreate, db: DbSession
) -> InteresForm:
    remote_ip = request.client.host if request.client else None
    await verify_recaptcha_token(payload.recaptcha_token, remote_ip)

    interes_form = InteresForm(**payload.model_dump(exclude={"recaptcha_token"}))
    db.add(interes_form)
    await db.commit()
    await db.refresh(interes_form)
    return interes_form


@router.get("/{interes_id}", response_model=InteresFormPublic)
async def get_interes_form(interes_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> InteresForm:
    interes_form = await db.get(InteresForm, interes_id)
    if interes_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interest form not found")
    return interes_form


@router.put("/{interes_id}", response_model=InteresFormPublic)
async def update_interes_form(
    interes_id: uuid.UUID, payload: InteresFormUpdate, db: DbSession, _admin: AdminUser
) -> InteresForm:
    interes_form = await db.get(InteresForm, interes_id)
    if interes_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interest form not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(interes_form, field, value)
    await db.commit()
    await db.refresh(interes_form)
    return interes_form


@router.delete("/{interes_id}", response_model=InteresFormPublic)
async def delete_interes_form(
    interes_id: uuid.UUID, db: DbSession, _admin: AdminUser
) -> InteresForm:
    interes_form = await db.get(InteresForm, interes_id)
    if interes_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interest form not found")
    await db.delete(interes_form)
    await db.commit()
    return interes_form
