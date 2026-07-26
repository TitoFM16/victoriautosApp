import datetime
import uuid

from pydantic import BaseModel

from victoriautos_backend.schemas.common import ORMModel


class OfertaFormFields(BaseModel):
    nombre: str
    apellido: str
    celular: str
    email: str
    wpp_check: bool = False
    marca: str
    linea: str
    modelo: int
    km: str
    matricula: str
    price: str


class OfertaFormCreate(OfertaFormFields):
    """Multipart form fields; `car_images` files are handled separately."""

    recaptcha_token: str


class OfertaFormUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    celular: str | None = None
    email: str | None = None
    wpp_check: bool | None = None
    marca: str | None = None
    linea: str | None = None
    modelo: int | None = None
    km: str | None = None
    matricula: str | None = None
    price: str | None = None
    status: str | None = None


class OfertaFormPublic(ORMModel):
    id: uuid.UUID
    nombre: str
    apellido: str
    celular: str
    email: str
    wpp_check: bool
    marca: str
    linea: str
    modelo: int
    km: str
    matricula: str
    price: str
    images: list[str]
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
