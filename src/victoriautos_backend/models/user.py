from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from victoriautos_backend.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    firstname: Mapped[str] = mapped_column(String, default="")
    lastname: Mapped[str] = mapped_column(String, default="")
    # `role` is kept for display/future use but, as in the original app, only the
    # `admin` boolean is actually checked by authorization logic.
    role: Mapped[str] = mapped_column(String, default="user")
    admin: Mapped[bool] = mapped_column(Boolean, default=False)
