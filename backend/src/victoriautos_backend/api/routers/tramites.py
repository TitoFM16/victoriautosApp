import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete, select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.models.tramite import Tramite
from victoriautos_backend.schemas.tramite import TramiteCreate, TramitePublic, TramiteUpdate

router = APIRouter(prefix="/api/tramites", tags=["tramites"])


@router.get("/", response_model=list[TramitePublic])
async def list_tramites(db: DbSession, _admin: AdminUser) -> list[Tramite]:
    """Admin-only: the original GET endpoints here had no auth check, unlike the
    analogous routes on every other resource - fixed here."""
    result = await db.execute(select(Tramite))
    return list(result.scalars().all())


@router.post("/", response_model=TramitePublic, status_code=status.HTTP_201_CREATED)
async def create_tramite(payload: TramiteCreate, db: DbSession, _admin: AdminUser) -> Tramite:
    tramite = Tramite(**payload.model_dump())
    db.add(tramite)
    await db.commit()
    await db.refresh(tramite)
    return tramite


@router.delete("/")
async def delete_all_tramites(db: DbSession, _admin: AdminUser) -> dict:
    result = await db.execute(delete(Tramite))
    await db.commit()
    return {"success": True, "deleted": result.rowcount}


@router.get("/{tramite_id}", response_model=TramitePublic)
async def get_tramite(tramite_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> Tramite:
    tramite = await db.get(Tramite, tramite_id)
    if tramite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tramite not found")
    return tramite


@router.put("/{tramite_id}", response_model=TramitePublic)
async def update_tramite(
    tramite_id: uuid.UUID, payload: TramiteUpdate, db: DbSession, _admin: AdminUser
) -> Tramite:
    tramite = await db.get(Tramite, tramite_id)
    if tramite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tramite not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tramite, field, value)
    await db.commit()
    await db.refresh(tramite)
    return tramite


@router.delete("/{tramite_id}", response_model=TramitePublic)
async def delete_tramite(tramite_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> Tramite:
    tramite = await db.get(Tramite, tramite_id)
    if tramite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tramite not found")
    await db.delete(tramite)
    await db.commit()
    return tramite
