import uuid
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from victoriautos_backend.core.security import InvalidTokenError, decode_access_token
from victoriautos_backend.db.session import get_db
from victoriautos_backend.models.user import User

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    token: Annotated[str | None, Cookie()] = None,
) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if token is None:
        raise unauthorized

    try:
        payload = decode_access_token(token)
    except InvalidTokenError as exc:
        raise unauthorized from exc

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise unauthorized from exc

    user = await db.get(User, user_id)
    if user is None:
        raise unauthorized
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def require_admin(current_user: CurrentUser) -> User:
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: You are not allowed to access this page.",
        )
    return current_user


AdminUser = Annotated[User, Depends(require_admin)]
