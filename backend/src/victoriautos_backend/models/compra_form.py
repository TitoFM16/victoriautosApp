import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from victoriautos_backend.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from victoriautos_backend.models.car import Car


class CompraForm(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """ "Purchase this specific car" lead form."""

    __tablename__ = "compra_forms"

    nombre: Mapped[str] = mapped_column(String, default="")
    apellido: Mapped[str] = mapped_column(String, default="")
    # Stored as text (not a number) so leading zeros / "+57" prefixes survive round-tripping.
    celular: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, default="")
    cedula: Mapped[str] = mapped_column(String, nullable=False)
    wpp_check: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String, default="PENDING")
    # When the lead accepted the data-processing policy (server clock). NULL for
    # records imported from the legacy app, which never asked for consent.
    privacy_accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    car_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("cars.id", ondelete="SET NULL"), nullable=True
    )
    car: Mapped[Car | None] = relationship(lazy="joined")
