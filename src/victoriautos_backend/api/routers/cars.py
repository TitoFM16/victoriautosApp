import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from victoriautos_backend.api.deps import DbSession
from victoriautos_backend.models.car import Car, CarStatus
from victoriautos_backend.schemas.car import CarPublic

router = APIRouter(prefix="/api/cars", tags=["cars"])


@router.get("/", response_model=list[CarPublic])
async def list_cars(
    db: DbSession,
    limit: int | None = Query(default=None, ge=1),
    page: int = Query(default=1, ge=1),
    marca: str | None = None,
    linea: str | None = None,
    mobile: bool = False,
) -> list[Car]:
    stmt = select(Car).where(Car.status == CarStatus.ALMACEN)
    if marca:
        stmt = stmt.where(Car.marca == marca)
    if linea:
        stmt = stmt.where(Car.linea == linea)
    if limit:
        stmt = stmt.offset((page - 1) * limit).limit(limit)

    cars = list((await db.execute(stmt)).scalars().all())
    if not mobile:
        return cars

    # For mobile clients, trim to the first image only - build response schemas
    # rather than mutating the ORM instances (which would dirty the session).
    mobile_cars = [CarPublic.model_validate(car) for car in cars]
    for car in mobile_cars:
        car.images = car.images[:1]
    return mobile_cars


@router.get("/{car_id}", response_model=CarPublic)
async def get_car(car_id: uuid.UUID, db: DbSession) -> Car:
    car = await db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")
    if car.status != CarStatus.ALMACEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Car not available")
    return car
