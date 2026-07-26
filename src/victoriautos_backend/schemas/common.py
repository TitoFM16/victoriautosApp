from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base for response schemas read from SQLAlchemy ORM instances."""

    model_config = ConfigDict(from_attributes=True)
