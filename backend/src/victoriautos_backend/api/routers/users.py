from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, Request, Response, status
from sqlalchemy import select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.core.config import settings
from victoriautos_backend.core.rate_limit import limiter
from victoriautos_backend.core.security import (
    InvalidTokenError,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from victoriautos_backend.models.user import User
from victoriautos_backend.schemas.user import UserLogin, UserPublic, UserSignup

router = APIRouter(prefix="/api/users", tags=["users"])

COOKIE_NAME = "token"


def _cookie_kwargs() -> dict:
    """SameSite=None is required for the cookie to be sent on cross-site API calls
    (frontend and backend live on different origins per the CORS whitelist) - browsers
    require Secure for SameSite=None, so that combination only applies outside local dev.
    """
    if settings.environment == "production":
        return {"secure": True, "samesite": "none"}
    return {"secure": False, "samesite": "lax"}


@router.get("/", response_model=list[UserPublic])
async def list_users(db: DbSession, _admin: AdminUser) -> list[User]:
    result = await db.execute(select(User))
    return list(result.scalars().all())


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(request: Request, payload: UserSignup, db: DbSession) -> User:
    existing = await db.scalar(select(User).where(User.username == payload.username))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        firstname=payload.firstname,
        lastname=payload.lastname,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, payload: UserLogin, response: Response, db: DbSession) -> dict:
    user = await db.scalar(select(User).where(User.username == payload.username))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed"
        )

    token = create_access_token(user.id)
    response.set_cookie(COOKIE_NAME, token, httponly=True, **_cookie_kwargs())
    return {"success": True, "user": {"id": str(user.id), "username": user.username}}


@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(COOKIE_NAME)
    return {"success": True}


@router.get("/check-auth-cookie")
async def check_auth_cookie(token: Annotated[str | None, Cookie()] = None) -> dict:
    if token is None:
        return {"authenticated": False}
    try:
        decode_access_token(token)
    except InvalidTokenError:
        return {"authenticated": False}
    return {"authenticated": True}
