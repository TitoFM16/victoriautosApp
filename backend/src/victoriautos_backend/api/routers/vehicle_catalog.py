from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from sqlalchemy import distinct, select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.models.vehicle_catalog import VehicleCatalogEntry
from victoriautos_backend.schemas.vehicle_catalog import LineaCreate, MarcaCreate

router = APIRouter(prefix="/api/buscavehiculo", tags=["busca-vehiculo"])


@router.get("/")
async def cascading_lookup(
    db: DbSession,
    tipo: str | None = Query(default=None),
    marca: str | None = Query(default=None),
) -> list[dict] | dict:
    """Cascading tipo -> marca -> linea/version lookup powering the frontend's
    search dropdowns. `tipo=all` (at either level) means "no tipo filter"."""
    if tipo is None:
        rows = (await db.execute(select(distinct(VehicleCatalogEntry.tipo)))).scalars().all()
        return [{"tipo": row} for row in rows]

    if marca is None:
        stmt = select(distinct(VehicleCatalogEntry.marca))
        if tipo != "all":
            stmt = stmt.where(VehicleCatalogEntry.tipo == tipo)
        rows = (await db.execute(stmt)).scalars().all()
        return [{"marca": row} for row in rows]

    stmt = select(VehicleCatalogEntry.linea, VehicleCatalogEntry.version).distinct()
    if tipo != "all":
        stmt = stmt.where(VehicleCatalogEntry.tipo == tipo)
    stmt = stmt.where(VehicleCatalogEntry.marca == marca)
    rows = (await db.execute(stmt)).all()
    return [{"linea": row.linea, "version": row.version} for row in rows]


@router.post("/marca")
async def add_marca(payload: MarcaCreate, db: DbSession, _admin: AdminUser) -> JSONResponse:
    existing = await db.scalar(
        select(VehicleCatalogEntry).where(
            VehicleCatalogEntry.tipo == payload.tipo, VehicleCatalogEntry.marca == payload.marca
        )
    )
    if existing is not None:
        return JSONResponse({"message": "Marca already exists for this tipo"})

    db.add(VehicleCatalogEntry(tipo=payload.tipo, marca=payload.marca, linea="DEFAULT"))
    await db.commit()
    return JSONResponse(
        status_code=201,
        content={
            "message": "Marca added successfully",
            "tipo": payload.tipo,
            "marca": payload.marca,
        },
    )


@router.post("/linea")
async def add_linea(payload: LineaCreate, db: DbSession, _admin: AdminUser) -> JSONResponse:
    existing = await db.scalar(
        select(VehicleCatalogEntry).where(
            VehicleCatalogEntry.tipo == payload.tipo,
            VehicleCatalogEntry.marca == payload.marca,
            VehicleCatalogEntry.linea == payload.linea,
            VehicleCatalogEntry.version == payload.version,
        )
    )
    if existing is not None:
        return JSONResponse({"message": "Linea already exists for this tipo and marca"})

    db.add(
        VehicleCatalogEntry(
            tipo=payload.tipo, marca=payload.marca, linea=payload.linea, version=payload.version
        )
    )
    await db.commit()
    return JSONResponse(
        status_code=201,
        content={
            "message": "Linea added successfully",
            "tipo": payload.tipo,
            "marca": payload.marca,
            "linea": payload.linea,
            "version": payload.version,
        },
    )
