import datetime
import uuid
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from victoriautos_backend.db.base import Base, UUIDPrimaryKeyMixin


class PlateSearch(UUIDPrimaryKeyMixin, Base):
    """Cached SIMIT/Fasecolda lookup result, one row per (plate, user)."""

    __tablename__ = "plate_searches"
    __table_args__ = (UniqueConstraint("plate", "user_id", name="uq_plate_searches_plate_user"),)

    plate: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    simit_result: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    fasecolda_result: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    date: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    retries: Mapped[int] = mapped_column(default=0)
