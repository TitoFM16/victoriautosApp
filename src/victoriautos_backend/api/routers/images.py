from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from victoriautos_backend.api.deps import AdminUser
from victoriautos_backend.core.config import settings

router = APIRouter(prefix="/images", tags=["images"])


def _resolve_safe_path(base_dir: Path, relative_path: str) -> Path:
    """Resolve `relative_path` under `base_dir`, rejecting anything that would
    escape it (the original Express handler joined the raw path param with no
    containment check, a path-traversal bug fixed here)."""
    candidate = (base_dir / relative_path).resolve()
    base_resolved = base_dir.resolve()
    if candidate != base_resolved and base_resolved not in candidate.parents:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    if not candidate.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return candidate


@router.get("/vehiculos/{file_path:path}")
async def get_vehiculo_image(file_path: str) -> FileResponse:
    """Vehicle inventory photos are public - no auth, same as the original."""
    return FileResponse(_resolve_safe_path(settings.vehiculos_images_dir, file_path))


@router.get("/ofertas/{file_path:path}")
async def get_oferta_image(file_path: str, _admin: AdminUser) -> FileResponse:
    """ "Sell us your car" submission photos are unverified public uploads, so
    stay admin-only, same as the original."""
    return FileResponse(_resolve_safe_path(settings.ofertas_images_dir, file_path))
