import io
from pathlib import Path

import pytest
from fastapi import HTTPException, UploadFile
from PIL import Image

from victoriautos_backend.core.config import settings
from victoriautos_backend.services.image_processing import THUMB_DIR, process_images


def _upload(name: str, image: Image.Image, fmt: str, **save_kwargs) -> UploadFile:
    buf = io.BytesIO()
    image.save(buf, format=fmt, **save_kwargs)
    buf.seek(0)
    return UploadFile(file=buf, filename=name)


async def test_large_upload_is_downscaled_with_thumbnail(tmp_path: Path):
    files = [_upload("big.jpg", Image.new("RGB", (4000, 3000), "red"), "JPEG")]

    assert await process_images(files, tmp_path) == ["0.webp"]

    with Image.open(tmp_path / "0.webp") as full:
        assert full.format == "WEBP"
        assert full.size == (settings.image_max_dimension, settings.image_max_dimension * 3 // 4)
    with Image.open(tmp_path / THUMB_DIR / "0.webp") as thumb:
        assert max(thumb.size) == settings.image_thumb_dimension


async def test_webp_upload_is_reencoded_not_stored_as_is(tmp_path: Path):
    files = [_upload("big.webp", Image.new("RGB", (3000, 2000), "blue"), "WEBP", quality=100)]

    await process_images(files, tmp_path)

    with Image.open(tmp_path / "0.webp") as full:
        assert max(full.size) == settings.image_max_dimension


async def test_small_upload_is_not_upscaled(tmp_path: Path):
    await process_images([_upload("s.png", Image.new("RGB", (300, 200)), "PNG")], tmp_path)

    with Image.open(tmp_path / "0.webp") as full, Image.open(tmp_path / THUMB_DIR / "0.webp") as th:
        assert full.size == (300, 200)
        assert th.size == (300, 200)


async def test_exif_rotation_is_applied(tmp_path: Path):
    exif = Image.Exif()
    exif[0x0112] = 6  # Orientation: rotate 90 CW when displayed
    files = [_upload("phone.jpg", Image.new("RGB", (400, 300)), "JPEG", exif=exif)]

    await process_images(files, tmp_path)

    with Image.open(tmp_path / "0.webp") as full:
        assert full.size == (300, 400)


async def test_corrupt_image_is_rejected_and_cleaned_up(tmp_path: Path):
    upload_dir = tmp_path / "car"
    files = [UploadFile(file=io.BytesIO(b"not an image"), filename="fake.jpg")]

    with pytest.raises(HTTPException) as exc:
        await process_images(files, upload_dir)

    assert exc.value.status_code == 400
    assert not upload_dir.exists()
