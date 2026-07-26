from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from victoriautos_backend.db.base import Base


class VehicleCatalogEntry(Base):
    """Reference catalog of tipo/marca/linea/version/motor/fabricacion, powering the
    cascading dropdowns behind `/api/buscavehiculo`. A plain lookup table, not linked
    to inventory `cars` by FK - it existed as a separate Postgres table before this
    migration and stays that way. `motor`/`fabricacion` aren't queried by any current
    endpoint but are preserved for fidelity with the existing catalog data.
    """

    __tablename__ = "vehiculos"
    __table_args__ = (
        UniqueConstraint("tipo", "marca", "linea", "version", name="uq_vehiculos_catalog_entry"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tipo: Mapped[str] = mapped_column(String, nullable=False, index=True)
    marca: Mapped[str] = mapped_column(String, nullable=False, index=True)
    linea: Mapped[str] = mapped_column(String, default="")
    version: Mapped[str] = mapped_column(String, default="")
    motor: Mapped[str | None] = mapped_column(String, nullable=True)
    fabricacion: Mapped[str | None] = mapped_column(String, nullable=True)
