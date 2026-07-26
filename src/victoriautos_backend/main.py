import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

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

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Victoria Autos API",
    description=(
        "Vehicle dealership platform API: public inventory listings, lead-capture "
        "forms, admin back office, contract PDF generation, and plate lookups."
    ),
    version="1.0.0",
)

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


@app.get("/api/", tags=["health"])
async def health_check() -> dict:
    """Replaces the original's default Express/Pug landing page - now a plain
    JSON health check, matching the API-only nature of this service."""
    return {"status": "ok"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
