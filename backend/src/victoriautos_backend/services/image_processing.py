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


def _write_webp_files(upload_dir: Path, items: list[tuple[bytes, str | None]]) -> list[str]:
    """Blocking file/image work - runs in a worker thread, never on the event loop."""
    upload_dir.mkdir(parents=True, exist_ok=True)
    filenames = []
    for index, (data, content_type) in enumerate(items):
        output_path = upload_dir / f"{index}.webp"
        if content_type == "image/webp":
            output_path.write_bytes(data)
        else:
            with Image.open(io.BytesIO(data)) as image:
                image.save(output_path, format="WEBP", quality=settings.webp_quality)
        filenames.append(f"{index}.webp")
    return filenames


def _delete_dir_if_exists(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)


async def process_images(files: list[UploadFile], upload_dir: Path) -> list[str]:
    """Convert each uploaded file to WEBP (or store as-is if already WEBP) under
    `upload_dir`, named `0.webp`, `1.webp`, ... Returns the stored filenames."""
    items: list[tuple[bytes, str | None]] = []
    for file in files:
        _validate_image_file(file)
        data = await file.read()
        if len(data) > settings.max_upload_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"{file.filename} exceeds the 20MB upload limit",
            )
        items.append((data, file.content_type))

    return await anyio.to_thread.run_sync(_write_webp_files, upload_dir, items)


async def delete_image_folder(base_dir: Path, folder_id: uuid.UUID) -> None:
    target = base_dir / str(folder_id)
    await anyio.to_thread.run_sync(_delete_dir_if_exists, target)
