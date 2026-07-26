import datetime
import uuid

from pydantic import BaseModel

from victoriautos_backend.schemas.common import ORMModel


class InteresFormCreate(BaseModel):
    nombre: str
    apellido: str
    celular: str
    email: str | None = None
    wpp_check: bool = False
    marca: str
    linea: str
    modelo: int
    km: str
    price: str
    recaptcha_token: str


class InteresFormUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    celular: str | None = None
    email: str | None = None
    wpp_check: bool | None = None
    marca: str | None = None
    linea: str | None = None
    modelo: int | None = None
    km: str | None = None
    price: str | None = None
    status: str | None = None


class InteresFormPublic(ORMModel):
    id: uuid.UUID
    nombre: str
    apellido: str
    celular: str
    email: str | None
    wpp_check: bool
    marca: str
    linea: str
    modelo: int
    km: str
    price: str
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
