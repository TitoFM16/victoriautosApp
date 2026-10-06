from pydantic import BaseModel, ConfigDict, field_validator


class ORMModel(BaseModel):
    """Base for response schemas read from SQLAlchemy ORM instances."""

    model_config = ConfigDict(from_attributes=True)


PRIVACY_REQUIRED_MESSAGE = "Debes aceptar la política de tratamiento de datos personales."


class PrivacyConsentIn(BaseModel):
    """Prior, express authorization required by Ley 1581 de 2012 before storing a
    lead's personal data. Routers persist it as a server-side `privacy_accepted_at`."""

    privacy_accepted: bool

    @field_validator("privacy_accepted")
    @classmethod
    def _must_accept(cls, value: bool) -> bool:
        if not value:
            raise ValueError(PRIVACY_REQUIRED_MESSAGE)
        return value
