import datetime
import enum
from decimal import Decimal

from sqlalchemy import ARRAY, CheckConstraint, Date, Numeric, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from victoriautos_backend.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CarStatus(enum.StrEnum):
    ALMACEN = "ALMACEN"
    VENDIDO = "VENDIDO"
    OFERTADO = "OFERTADO"
    OCULTO = "OCULTO"


class Car(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Vehicle inventory.

    `id` doubles as the image-folder name under `data/images/vehiculos/<id>/`,
    unifying what used to be a separate Mongo `_id` plus a duplicate `uuid` field.
    """

    __tablename__ = "cars"
    __table_args__ = (CheckConstraint("price >= 0", name="ck_cars_price_non_negative"),)

    tipo: Mapped[str] = mapped_column(String, nullable=False)
    marca: Mapped[str] = mapped_column(String, nullable=False)
    linea: Mapped[str] = mapped_column(String, nullable=False)
    modelo: Mapped[int] = mapped_column(nullable=False)
    km: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    matricula: Mapped[str] = mapped_column(String, nullable=False)
    color: Mapped[str] = mapped_column(String, nullable=False)
    transmision: Mapped[str] = mapped_column(String, nullable=False)
    combustible: Mapped[str] = mapped_column(String, nullable=False)
    cilindraje: Mapped[str] = mapped_column(String, nullable=False)
    traccion: Mapped[str] = mapped_column(String, nullable=False)
    direccion: Mapped[str] = mapped_column(String, nullable=False)
    frenos: Mapped[str] = mapped_column(String, nullable=False)
    airbag: Mapped[str] = mapped_column(String, nullable=False)

    # Sensitive fields: excluded from the public-facing schema (see schemas/car.py),
    # mirroring the old Mongoose `select: false` fields.
    placa: Mapped[str] = mapped_column(String, nullable=False)
    vin: Mapped[str | None] = mapped_column(String, nullable=True)
    chasis_no: Mapped[str | None] = mapped_column(String, nullable=True)
    motor_no: Mapped[str | None] = mapped_column(String, nullable=True)
    importacion_no: Mapped[str | None] = mapped_column(String, nullable=True)
    importacion_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)

    status: Mapped[CarStatus] = mapped_column(SAEnum(CarStatus, name="car_status"), nullable=False)
    consignacion: Mapped[bool] = mapped_column(default=False)
    featured: Mapped[bool] = mapped_column(default=False)
    images: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, server_default="{}")
