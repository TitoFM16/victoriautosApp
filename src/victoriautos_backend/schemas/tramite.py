import datetime
import uuid
from decimal import Decimal

from pydantic import BaseModel

from victoriautos_backend.schemas.car import CarPublic
from victoriautos_backend.schemas.common import ORMModel


class TramiteCreate(BaseModel):
    tramitador: str
    celular: str
    estado: str = ""
    documentos: list[str] = []
    observaciones: list[str] = []
    precio: Decimal = Decimal(0)
    car_id: uuid.UUID | None = None


class TramiteUpdate(BaseModel):
    tramitador: str | None = None
    celular: str | None = None
    fecha_fin: datetime.datetime | None = None
    estado: str | None = None
    documentos: list[str] | None = None
    observaciones: list[str] | None = None
    precio: Decimal | None = None
    car_id: uuid.UUID | None = None


class TramitePublic(ORMModel):
    id: uuid.UUID
    tramitador: str
    celular: str
    fecha_inicio: datetime.datetime
    fecha_fin: datetime.datetime | None
    estado: str
    documentos: list[str]
    observaciones: list[str]
    precio: Decimal
    car: CarPublic | None
    created_at: datetime.datetime
    updated_at: datetime.datetime
