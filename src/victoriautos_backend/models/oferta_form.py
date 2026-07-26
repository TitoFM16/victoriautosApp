from sqlalchemy import ARRAY, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from victoriautos_backend.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OfertaForm(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """ "Sell us your car" lead form, with photos. `id` doubles as the image-folder name
    under `data/images/ofertas/<id>/`."""

    __tablename__ = "ofertas_forms"

    nombre: Mapped[str] = mapped_column(String, default="")
    apellido: Mapped[str] = mapped_column(String, default="")
    celular: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, default="")
    wpp_check: Mapped[bool] = mapped_column(Boolean, default=False)
    marca: Mapped[str] = mapped_column(String, default="")
    linea: Mapped[str] = mapped_column(String, default="")
    modelo: Mapped[int] = mapped_column(nullable=False)
    km: Mapped[str] = mapped_column(String, default="")
    matricula: Mapped[str] = mapped_column(String, default="")
    price: Mapped[str] = mapped_column(String, default="")
    images: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, server_default="{}")
    status: Mapped[str] = mapped_column(String, default="PENDING")
