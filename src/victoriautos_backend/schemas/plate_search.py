import datetime
import uuid
from typing import Any

from pydantic import BaseModel

from victoriautos_backend.schemas.common import ORMModel


class PlateSearchRequest(BaseModel):
    plate: str


class PlateSearchResult(BaseModel):
    plate: str
    simit_result: Any
    fasecolda_result: Any
    date: datetime.datetime


class PlateSearchHistoryEntry(ORMModel):
    id: uuid.UUID
    plate: str
    simit_result: Any
    fasecolda_result: Any
    date: datetime.datetime
    retries: int
