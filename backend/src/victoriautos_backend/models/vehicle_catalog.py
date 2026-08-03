import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from victoriautos_backend.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


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


class VehicleCatalogSource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """One refreshable upstream catalog, with enough state to audit sync health."""

    __tablename__ = "vehicle_catalog_sources"

    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    homepage_url: Mapped[str] = mapped_column(Text, nullable=False)
    attribution: Mapped[str] = mapped_column(Text, default="")
    source_updated_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    publish_to_forms: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_success_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    item_count: Mapped[int] = mapped_column(Integer, default=0)


class VehicleCatalogItem(Base):
    """A source-preserving, refreshable brand/line/model-year catalog row."""

    __tablename__ = "vehicle_catalog_items"
    __table_args__ = (
        UniqueConstraint("source_id", "external_key", name="uq_catalog_items_source_key"),
        Index(
            "ix_catalog_items_form_lookup",
            "active",
            "form_type",
            "brand",
            "line",
            "model_year",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("vehicle_catalog_sources.id", ondelete="CASCADE"),
        nullable=False,
    )
    external_key: Mapped[str] = mapped_column(String(64), nullable=False)
    source_dataset_id: Mapped[str] = mapped_column(String(300), nullable=False)
    source_record_id: Mapped[str] = mapped_column(String(160), default="")
    raw_vehicle_type: Mapped[str] = mapped_column(String(120), default="")
    form_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    brand: Mapped[str] = mapped_column(String(160), nullable=False)
    line: Mapped[str] = mapped_column(String(300), nullable=False)
    version: Mapped[str] = mapped_column(String(300), default="")
    model_year: Mapped[int] = mapped_column(Integer, nullable=False)
    engine_cc: Mapped[int | None] = mapped_column(Integer, nullable=True)
    market_value_cop: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    observations: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sync_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
