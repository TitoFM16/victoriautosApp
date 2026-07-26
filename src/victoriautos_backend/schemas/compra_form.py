import datetime
import uuid

from pydantic import BaseModel

from victoriautos_backend.schemas.car import CarPublic
from victoriautos_backend.schemas.common import ORMModel


class CompraFormCreate(BaseModel):
    nombre: str
    apellido: str
    celular: str
    email: str
    cedula: str
    wpp_check: bool = False
    car_id: uuid.UUID | None = None
    recaptcha_token: str


class CompraFormPublic(ORMModel):
    id: uuid.UUID
    nombre: str
    apellido: str
    celular: str
    email: str
    cedula: str
    wpp_check: bool
    status: str
    car: CarPublic | None
    created_at: datetime.datetime
    updated_at: datetime.datetime
