import datetime
import uuid
from decimal import Decimal

from sqlalchemy import ARRAY, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from victoriautos_backend.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from victoriautos_backend.models.car import Car


class Tramite(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Internal tracking of registration/paperwork procedures for a car."""

    __tablename__ = "tramites"

    tramitador: Mapped[str] = mapped_column(String, default="")
    celular: Mapped[str] = mapped_column(String, nullable=False)
    fecha_inicio: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    fecha_fin: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    # Free-text status ("sin iniciar" / "en proceso" / "finalizado"), matching the original.
    estado: Mapped[str] = mapped_column(String, default="")
    documentos: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, server_default="{}")
    observaciones: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    precio: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)

    car_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("cars.id", ondelete="SET NULL"), nullable=True
    )
    car: Mapped[Car | None] = relationship(lazy="joined")
