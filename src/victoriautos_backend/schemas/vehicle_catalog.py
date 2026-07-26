from pydantic import BaseModel

from victoriautos_backend.schemas.common import ORMModel


class TipoEntry(ORMModel):
    tipo: str


class MarcaEntry(ORMModel):
    marca: str


class LineaEntry(ORMModel):
    linea: str
    version: str


class MarcaCreate(BaseModel):
    tipo: str
    marca: str


class LineaCreate(BaseModel):
    tipo: str
    marca: str
    linea: str
    version: str = ""
