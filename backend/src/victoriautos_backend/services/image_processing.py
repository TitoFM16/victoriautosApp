import io
import shutil
import uuid
from pathlib import Path

import anyio
from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError

from victoriautos_backend.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
THUMB_DIR = "thumb"


def _validate_image_file(file: UploadFile) -> None:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can upload only image files!",
        )


def _save_webp(image: Image.Image, path: Path, max_dimension: int) -> None:
    variant = image.copy()
    variant.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
    variant.save(path, format="WEBP", quality=settings.webp_quality, method=6)


def write_optimized_variants(image: Image.Image, folder: Path, filename: str) -> None:
    """Write `<folder>/<filename>` (long edge <= image_max_dimension) and
    `<folder>/thumb/<filename>` (long edge <= image_thumb_dimension), both WEBP.
    Shared by uploads and scripts/optimize_images.py."""
    # Phone photos carry their rotation in EXIF, which WEBP output drops.
    image = ImageOps.exif_transpose(image)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
    (folder / THUMB_DIR).mkdir(parents=True, exist_ok=True)
    _save_webp(image, folder / filename, settings.image_max_dimension)
    _save_webp(image, folder / THUMB_DIR / filename, settings.image_thumb_dimension)


def _write_webp_file(upload_dir: Path, data: bytes, index: int) -> str:
    """Blocking image work runs in a worker thread, one image at a time.
    Every upload is re-encoded (WEBP included) so oversized phone photos never
    reach the public site."""
    filename = f"{index}.webp"
    try:
        with Image.open(io.BytesIO(data)) as image:
            write_optimized_variants(image, upload_dir, filename)
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or corrupt image file"
        ) from exc
    return filename


def _delete_dir_if_exists(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)


async def process_images(files: list[UploadFile], upload_dir: Path) -> list[str]:
    """Convert each uploaded file to a resized WEBP under `upload_dir`, named
    `0.webp`, `1.webp`, ..., plus a thumbnail of each in `upload_dir/thumb/`.
    Returns the stored filenames."""
    if len(files) > settings.max_upload_files:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"At most {settings.max_upload_files} images are allowed per request",
        )
    filenames = []
    try:
        for index, file in enumerate(files):
            _validate_image_file(file)
            data = await file.read(settings.max_upload_size_bytes + 1)
            if len(data) > settings.max_upload_size_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Image exceeds the {settings.max_upload_size_bytes} byte upload limit",
                )
            filenames.append(
                await anyio.to_thread.run_sync(_write_webp_file, upload_dir, data, index)
            )
            del data
    except Exception:
        await anyio.to_thread.run_sync(_delete_dir_if_exists, upload_dir)
        raise
    return filenames


async def delete_image_folder(base_dir: Path, folder_id: uuid.UUID) -> None:
    target = base_dir / str(folder_id)
    await anyio.to_thread.run_sync(_delete_dir_if_exists, target)
