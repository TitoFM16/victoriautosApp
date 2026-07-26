import datetime
import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import delete, select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.core.config import settings
from victoriautos_backend.models.car import Car, CarStatus
from victoriautos_backend.models.interes_form import InteresForm
from victoriautos_backend.models.oferta_form import OfertaForm
from victoriautos_backend.schemas.car import CarAdmin, CarAdminCreate, CarAdminUpdate
from victoriautos_backend.schemas.match import CarInteresMatch, MatchResult, OfertaInteresMatch
from victoriautos_backend.services.image_processing import delete_image_folder, process_images

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/cars", response_model=list[CarAdmin])
async def list_all_cars(db: DbSession, _admin: AdminUser) -> list[Car]:
    result = await db.execute(select(Car))
    return list(result.scalars().all())


async def _car_admin_create_form(
    tipo: Annotated[str, Form()],
    marca: Annotated[str, Form()],
    linea: Annotated[str, Form()],
    modelo: Annotated[int, Form()],
    km: Annotated[str, Form()],
    price: Annotated[Decimal, Form()],
    matricula: Annotated[str, Form()],
    color: Annotated[str, Form()],
    transmision: Annotated[str, Form()],
    combustible: Annotated[str, Form()],
    cilindraje: Annotated[str, Form()],
    traccion: Annotated[str, Form()],
    direccion: Annotated[str, Form()],
    frenos: Annotated[str, Form()],
    airbag: Annotated[str, Form()],
    placa: Annotated[str, Form()],
    status_: Annotated[CarStatus, Form(alias="status")],
    vin: Annotated[str | None, Form()] = None,
    chasis_no: Annotated[str | None, Form()] = None,
    motor_no: Annotated[str | None, Form()] = None,
    importacion_no: Annotated[str | None, Form()] = None,
    importacion_date: Annotated[datetime.date | None, Form()] = None,
    consignacion: Annotated[bool, Form()] = False,
    featured: Annotated[bool, Form()] = False,
) -> CarAdminCreate:
    # FastAPI 0.140 can't bind a `Form()`-wrapped Pydantic model alongside a
    # separate `File()` list parameter in the same endpoint (verified: plain
    # Form(...) fields work fine, the model shortcut doesn't) - so each field is
    # declared individually here and assembled into the schema by hand.
    return CarAdminCreate(
        tipo=tipo,
        marca=marca,
        linea=linea,
        modelo=modelo,
        km=km,
        price=price,
        matricula=matricula,
        color=color,
        transmision=transmision,
        combustible=combustible,
        cilindraje=cilindraje,
        traccion=traccion,
        direccion=direccion,
        frenos=frenos,
        airbag=airbag,
        placa=placa,
        vin=vin,
        chasis_no=chasis_no,
        motor_no=motor_no,
        importacion_no=importacion_no,
        importacion_date=importacion_date,
        status=status_,
        consignacion=consignacion,
        featured=featured,
    )


@router.post("/cars", response_model=CarAdmin, status_code=status.HTTP_201_CREATED)
async def create_car(
    db: DbSession,
    _admin: AdminUser,
    car_in: Annotated[CarAdminCreate, Depends(_car_admin_create_form)],
    car_images: Annotated[list[UploadFile], File(default_factory=list)],
) -> Car:
    car_id = uuid.uuid4()
    images = []
    if car_images:
        upload_dir = settings.vehiculos_images_dir / str(car_id)
        images = await process_images(car_images, upload_dir)

    car = Car(id=car_id, **car_in.model_dump(), images=images)
    db.add(car)
    await db.commit()
    await db.refresh(car)
    return car


@router.delete("/cars", response_model=list[CarAdmin])
async def delete_all_cars(db: DbSession, _admin: AdminUser) -> list[Car]:
    cars = list((await db.execute(select(Car))).scalars().all())
    for car in cars:
        await delete_image_folder(settings.vehiculos_images_dir, car.id)
    await db.execute(delete(Car))
    await db.commit()
    return cars


@router.get("/cars/{car_id}", response_model=CarAdmin)
async def get_car(car_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> Car:
    car = await db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")
    return car


@router.put("/cars/{car_id}", response_model=CarAdmin)
async def update_car(
    car_id: uuid.UUID, payload: CarAdminUpdate, db: DbSession, _admin: AdminUser
) -> Car:
    car = await db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(car, field, value)

    await db.commit()
    await db.refresh(car)
    return car


@router.delete("/cars/{car_id}", response_model=CarAdmin)
async def delete_car(car_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> Car:
    car = await db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")

    await delete_image_folder(settings.vehiculos_images_dir, car.id)
    await db.delete(car)
    await db.commit()
    return car


@router.get("/match", response_model=MatchResult)
async def match_leads(db: DbSession, _admin: AdminUser) -> MatchResult:
    interes_forms = list((await db.execute(select(InteresForm))).scalars().all())
    cars = list(
        (await db.execute(select(Car).where(Car.status == CarStatus.ALMACEN))).scalars().all()
    )
    ofertas = list((await db.execute(select(OfertaForm))).scalars().all())

    cars_match = [
        CarInteresMatch(car=car, interes=interes)
        for interes in interes_forms
        for car in cars
        if interes.marca == car.marca and interes.linea == car.linea
    ]
    cars_match_oferta = [
        OfertaInteresMatch(oferta=oferta, interes=interes)
        for interes in interes_forms
        for oferta in ofertas
        if interes.marca == oferta.marca and interes.linea == oferta.linea
    ]

    return MatchResult(cars_match=cars_match, cars_match_oferta=cars_match_oferta)
