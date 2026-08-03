import os
import uuid
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from victoriautos_backend import models  # noqa: F401 - registers models on Base.metadata
from victoriautos_backend.core.config import settings
from victoriautos_backend.core.rate_limit import limiter
from victoriautos_backend.core.security import hash_password
from victoriautos_backend.db.base import Base
from victoriautos_backend.db.session import get_db
from victoriautos_backend.main import app
from victoriautos_backend.models.user import User

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", settings.database_url.rsplit("/", 1)[0] + "/victoriautos_test"
)

test_engine = create_async_engine(TEST_DATABASE_URL)
TestSessionLocal = async_sessionmaker(bind=test_engine, expire_on_commit=False)


async def _override_get_db() -> AsyncIterator[AsyncSession]:
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(scope="session", autouse=True)
async def _database_schema():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest.fixture(autouse=True)
async def _clean_tables():
    yield
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    """httpx's ASGI transport gives every request the same fake client IP, so
    without this, rate-limited endpoints (login/signup/lead forms) would trip
    across unrelated tests that happen to share a minute window."""
    limiter.reset()
    yield


@pytest.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    async with TestSessionLocal() as session:
        yield session


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def admin_client(db_session: AsyncSession) -> AsyncIterator[AsyncClient]:
    """An independent client authenticated as an admin user (own cookie jar) - a
    separate instance from `client`, so tests can use both to distinguish
    authenticated vs. unauthenticated behavior in the same test."""
    username = f"admin_{uuid.uuid4().hex[:8]}"
    password = "correct horse battery staple"
    db_session.add(User(username=username, password_hash=hash_password(password), admin=True))
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/users/login", json={"username": username, "password": password}
        )
        assert response.status_code == 200
        yield ac


@pytest.fixture
def bypass_recaptcha(monkeypatch: pytest.MonkeyPatch) -> None:
    """reCAPTCHA verification calls out to Google - bypass it in tests by patching
    the name each router module imported (patching the source module wouldn't
    affect already-bound `from ... import verify_recaptcha_token` references)."""

    async def _noop(token: str | None, remote_ip: str | None = None) -> None:
        return None

    for module in ("compra", "interes", "ofertas"):
        monkeypatch.setattr(
            f"victoriautos_backend.api.routers.{module}.verify_recaptcha_token", _noop
        )
