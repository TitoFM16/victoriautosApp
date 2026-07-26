import datetime
import uuid
from decimal import Decimal

from pydantic import BaseModel, Field

from victoriautos_backend.models.car import CarStatus
from victoriautos_backend.schemas.common import ORMModel


class CarBase(BaseModel):
    tipo: str
    marca: str
    linea: str
    modelo: int
    km: str
    price: Decimal = Field(ge=0)
    matricula: str
    color: str
    transmision: str
    combustible: str
    cilindraje: str
    traccion: str
    direccion: str
    frenos: str
    airbag: str


class CarAdminCreate(CarBase):
    """Admin car creation. Submitted as multipart form fields; `car_images` files
    are handled separately by the upload endpoint."""

    placa: str
    vin: str | None = None
    chasis_no: str | None = None
    motor_no: str | None = None
    importacion_no: str | None = None
    importacion_date: datetime.date | None = None
    status: CarStatus
    consignacion: bool = False
    featured: bool = False


class CarAdminUpdate(BaseModel):
    """Partial update. Only these fields are writable post-creation - images and
    the sensitive identity fields (vin/chasis_no/motor_no/importacion_*) are
    intentionally immutable after creation, matching the original admin whitelist."""

    price: Decimal | None = Field(default=None, ge=0)
    consignacion: bool | None = None
    tipo: str | None = None
    marca: str | None = None
    linea: str | None = None
    modelo: int | None = None
    combustible: str | None = None
    cilindraje: str | None = None
    traccion: str | None = None
    direccion: str | None = None
    frenos: str | None = None
    airbag: str | None = None
    placa: str | None = None
    status: CarStatus | None = None
    featured: bool | None = None
    km: str | None = None
    matricula: str | None = None
    color: str | None = None
    transmision: str | None = None


class CarPublic(CarBase, ORMModel):
    """Public listing - sensitive fields excluded (placa, vin, chasis_no, motor_no,
    importacion_no, importacion_date)."""

    id: uuid.UUID
    status: CarStatus
    consignacion: bool
    featured: bool
    images: list[str]
    created_at: datetime.datetime
    updated_at: datetime.datetime


class CarAdmin(CarPublic):
    """Full car record, sensitive fields included, for admin views."""

    placa: str
    vin: str | None
    chasis_no: str | None
    motor_no: str | None
    importacion_no: str | None
    importacion_date: datetime.date | None
