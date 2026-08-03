from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from sqlalchemy import distinct, select, union

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.models.vehicle_catalog import (
    VehicleCatalogEntry,
    VehicleCatalogItem,
    VehicleCatalogSource,
)
from victoriautos_backend.schemas.vehicle_catalog import LineaCreate, MarcaCreate

router = APIRouter(prefix="/api/buscavehiculo", tags=["busca-vehiculo"])


async def _combined_distinct(db: DbSession, legacy_stmt, refreshed_stmt) -> list:
    statement = union(legacy_stmt, refreshed_stmt).order_by(*legacy_stmt.selected_columns)
    return (await db.execute(statement)).all()


@router.get("/")
async def cascading_lookup(
    db: DbSession,
    tipo: str | None = Query(default=None),
    marca: str | None = Query(default=None),
) -> list[dict] | dict:
    """Cascading tipo -> marca -> linea/version lookup powering the frontend's
    search dropdowns. `tipo=all` (at either level) means "no tipo filter"."""
    if tipo is None:
        rows = await _combined_distinct(
            db,
            select(VehicleCatalogEntry.tipo.label("tipo")).distinct(),
            select(VehicleCatalogItem.form_type.label("tipo"))
            .join(VehicleCatalogSource)
            .where(VehicleCatalogItem.active.is_(True), VehicleCatalogItem.form_type.is_not(None))
            .where(VehicleCatalogSource.publish_to_forms.is_(True))
            .distinct(),
        )
        return [{"tipo": row.tipo} for row in rows]

    if marca is None:
        legacy_stmt = select(VehicleCatalogEntry.marca.label("marca")).distinct()
        refreshed_stmt = (
            select(VehicleCatalogItem.brand.label("marca"))
            .join(VehicleCatalogSource)
            .where(VehicleCatalogItem.active.is_(True))
            .where(VehicleCatalogSource.publish_to_forms.is_(True))
            .distinct()
        )
        if tipo != "all":
            legacy_stmt = legacy_stmt.where(VehicleCatalogEntry.tipo == tipo)
            refreshed_stmt = refreshed_stmt.where(VehicleCatalogItem.form_type == tipo)
        rows = await _combined_distinct(db, legacy_stmt, refreshed_stmt)
        return [{"marca": row.marca} for row in rows]

    legacy_stmt = select(VehicleCatalogEntry.linea, VehicleCatalogEntry.version).distinct()
    refreshed_stmt = (
        select(VehicleCatalogItem.line.label("linea"), VehicleCatalogItem.version)
        .join(VehicleCatalogSource)
        .where(VehicleCatalogItem.active.is_(True), VehicleCatalogItem.brand == marca)
        .where(VehicleCatalogSource.publish_to_forms.is_(True))
        .distinct()
    )
    if tipo != "all":
        legacy_stmt = legacy_stmt.where(VehicleCatalogEntry.tipo == tipo)
        refreshed_stmt = refreshed_stmt.where(VehicleCatalogItem.form_type == tipo)
    legacy_stmt = legacy_stmt.where(VehicleCatalogEntry.marca == marca)
    rows = await _combined_distinct(db, legacy_stmt, refreshed_stmt)
    return [{"linea": row.linea, "version": row.version} for row in rows]


@router.get("/modelos")
async def model_year_lookup(
    db: DbSession,
    marca: str = Query(min_length=1),
    linea: str = Query(min_length=1),
    tipo: str = Query(default="all"),
) -> list[dict[str, int]]:
    """List known model years for a refreshed brand/line selection, newest first."""
    statement = (
        select(distinct(VehicleCatalogItem.model_year))
        .where(
            VehicleCatalogItem.active.is_(True),
            VehicleCatalogItem.brand == marca,
            VehicleCatalogItem.line == linea,
        )
        .join(VehicleCatalogSource)
    )
    statement = statement.where(VehicleCatalogSource.publish_to_forms.is_(True))
    if tipo != "all":
        statement = statement.where(VehicleCatalogItem.form_type == tipo)
    years = (await db.execute(statement.order_by(VehicleCatalogItem.model_year.desc()))).scalars()
    return [{"modelo": year} for year in years]


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
