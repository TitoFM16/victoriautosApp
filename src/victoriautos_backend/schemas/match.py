from pydantic import BaseModel

from victoriautos_backend.schemas.car import CarAdmin
from victoriautos_backend.schemas.interes_form import InteresFormPublic
from victoriautos_backend.schemas.oferta_form import OfertaFormPublic


class CarInteresMatch(BaseModel):
    car: CarAdmin
    interes: InteresFormPublic


class OfertaInteresMatch(BaseModel):
    oferta: OfertaFormPublic
    interes: InteresFormPublic


class MatchResult(BaseModel):
    cars_match: list[CarInteresMatch]
    cars_match_oferta: list[OfertaInteresMatch]
