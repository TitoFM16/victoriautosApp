import datetime
import uuid

from pydantic import BaseModel

from victoriautos_backend.schemas.common import ORMModel


class UserSignup(BaseModel):
    username: str
    password: str
    firstname: str = ""
    lastname: str = ""


class UserLogin(BaseModel):
    username: str
    password: str


class UserPublic(ORMModel):
    id: uuid.UUID
    username: str
    firstname: str
    lastname: str
    role: str
    admin: bool
    created_at: datetime.datetime
