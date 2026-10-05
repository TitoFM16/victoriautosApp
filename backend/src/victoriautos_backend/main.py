import asyncio
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text

from victoriautos_backend.api.deps import DbSession
from victoriautos_backend.api.routers import (
    admin,
    busca_placa,
    cars,
    compra,
    images,
    interes,
    ofertas,
    tramites,
    users,
    vehicle_catalog,
    vende,
)
from victoriautos_backend.core.config import settings
from victoriautos_backend.core.logging import configure_logging
from victoriautos_backend.core.rate_limit import limiter
from victoriautos_backend.schemas.health import HealthResponse

configure_logging()
logger = logging.getLogger(__name__)


async def health_check() -> dict:
    """Replaces the original's default Express/Pug landing page - now a plain
    JSON health check, matching the API-only nature of this service."""
    return {"status": "ok"}


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


async def database_health(db: DbSession) -> HealthResponse:
    try:
        async with asyncio.timeout(5):
            await db.execute(text("SELECT 1"))
    # Drivers can raise raw connection/authentication errors before SQLAlchemy wraps them.
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return HealthResponse(status="ok")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Victoria Autos API",
        description=(
            "Vehicle dealership platform API: public inventory listings, lead-capture "
            "forms, admin back office, contract PDF generation, and plate lookups."
        ),
        version="1.0.0",
        docs_url=None if settings.environment == "production" else "/docs",
        redoc_url=None if settings.environment == "production" else "/redoc",
        openapi_url=None if settings.environment == "production" else "/openapi.json",
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(GZipMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    )

    app.include_router(cars.router)
    app.include_router(admin.router)
    app.include_router(compra.router)
    app.include_router(interes.router)
    app.include_router(ofertas.router)
    app.include_router(vende.router)
    app.include_router(tramites.router)
    app.include_router(users.router)
    app.include_router(vehicle_catalog.router)
    app.include_router(busca_placa.router)
    app.include_router(images.router)
    app.add_api_route("/api/", health_check, methods=["GET"], tags=["health"])
    app.add_api_route(
        "/api/health",
        database_health,
        methods=["GET"],
        tags=["health"],
        response_model=HealthResponse,
    )
    app.add_exception_handler(Exception, unhandled_exception_handler)
    return app


app = create_app()
