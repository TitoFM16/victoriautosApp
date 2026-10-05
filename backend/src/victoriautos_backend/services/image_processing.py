import io
import shutil
import uuid
from pathlib import Path

import anyio
from fastapi import HTTPException, UploadFile, status
from PIL import Image

from victoriautos_backend.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def _validate_image_file(file: UploadFile) -> None:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can upload only image files!",
        )


def _write_webp_file(upload_dir: Path, data: bytes, content_type: str | None, index: int) -> str:
    """Blocking image work runs in a worker thread, one image at a time."""
    upload_dir.mkdir(parents=True, exist_ok=True)
    output_path = upload_dir / f"{index}.webp"
    if content_type == "image/webp":
        output_path.write_bytes(data)
    else:
        with Image.open(io.BytesIO(data)) as image:
            image.save(output_path, format="WEBP", quality=settings.webp_quality)
    return output_path.name


def _delete_dir_if_exists(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)


async def process_images(files: list[UploadFile], upload_dir: Path) -> list[str]:
    """Convert each uploaded file to WEBP (or store as-is if already WEBP) under
    `upload_dir`, named `0.webp`, `1.webp`, ... Returns the stored filenames."""
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
                await anyio.to_thread.run_sync(
                    _write_webp_file, upload_dir, data, file.content_type, index
                )
            )
            del data
    except Exception:
        await anyio.to_thread.run_sync(_delete_dir_if_exists, upload_dir)
        raise
    return filenames


async def delete_image_folder(base_dir: Path, folder_id: uuid.UUID) -> None:
    target = base_dir / str(folder_id)
    await anyio.to_thread.run_sync(_delete_dir_if_exists, target)
