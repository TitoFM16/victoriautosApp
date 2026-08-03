from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from victoriautos_backend.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class InteresForm(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """ "I'm looking to buy a car like this" lead form (matched against inventory/offers)."""

    __tablename__ = "interes_forms"

    nombre: Mapped[str] = mapped_column(String, default="")
    apellido: Mapped[str] = mapped_column(String, default="")
    celular: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String, default="")
    wpp_check: Mapped[bool] = mapped_column(Boolean, default=False)
    marca: Mapped[str] = mapped_column(String, default="")
    linea: Mapped[str] = mapped_column(String, default="")
    modelo: Mapped[int] = mapped_column(nullable=False)
    # km/price are dropdown range labels (e.g. "0-50000", "50-100 millones"), not exact
    # numbers, so they stay text - matching the original schema's intent.
    km: Mapped[str] = mapped_column(String, default="")
    price: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="PENDING")
