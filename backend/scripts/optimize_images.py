"""Optimize already-uploaded photos so they match what new uploads produce.

New uploads are downscaled and get a `thumb/` variant automatically (see
services/image_processing.py). This one-off, re-runnable script brings the
existing files under IMAGES_DIR up to the same standard:

- creates `<folder>/thumb/<name>` when it is missing;
- re-encodes `<folder>/<name>` when its long edge exceeds IMAGE_MAX_DIMENSION,
  or when it is heavier than --max-kb and re-encoding saves at least 10%.

Empty or unreadable files are reported and left untouched. Each file is
written to a temporary directory first and then moved into place.

Usage:
    uv run python scripts/optimize_images.py --dry-run
    uv run python scripts/optimize_images.py
"""

import argparse
import os
import shutil
import tempfile
from pathlib import Path

from PIL import Image, UnidentifiedImageError

from victoriautos_backend.core.config import settings
from victoriautos_backend.services.image_processing import THUMB_DIR, write_optimized_variants


def optimize(dry_run: bool, max_kb: int) -> None:
    totals = {"files": 0, "reencoded": 0, "thumbs": 0, "skipped": 0, "before": 0, "after": 0}
    for kind in ("vehiculos", "ofertas"):
        base = settings.images_dir / kind
        for path in sorted(base.glob("*/*.webp")):
            totals["files"] += 1
            size = path.stat().st_size
            thumb = path.parent / THUMB_DIR / path.name
            try:
                with Image.open(path) as image:
                    image.load()
                    oversized = max(image.size) > settings.image_max_dimension
                    heavy = size > max_kb * 1024
                    needs_full = oversized or heavy
                    needs_thumb = not thumb.exists()
                    if not (needs_full or needs_thumb):
                        continue
                    action = "re-encode" if needs_full else "thumb"
                    print(f"{action:9} {path.relative_to(settings.images_dir)} ({size // 1024} KB)")
                    if dry_run:
                        totals["reencoded" if needs_full else "thumbs"] += 1
                        continue
                    with tempfile.TemporaryDirectory() as tmp:
                        tmp_dir = Path(tmp)
                        write_optimized_variants(image, tmp_dir, path.name)
                        thumb.parent.mkdir(exist_ok=True)
                        shutil.move(tmp_dir / THUMB_DIR / path.name, thumb)
                        totals["thumbs"] += needs_thumb
                        new_size = (tmp_dir / path.name).stat().st_size
                        # Re-encoding an already-optimized photo barely helps and
                        # costs quality, so keep the original unless it's oversized
                        # or the new file is clearly smaller.
                        if needs_full and (oversized or new_size < size * 0.9):
                            os.replace(tmp_dir / path.name, path)
                            totals["reencoded"] += 1
                            totals["before"] += size
                            totals["after"] += path.stat().st_size
            except (UnidentifiedImageError, OSError) as exc:
                totals["skipped"] += 1
                print(f"SKIP      {path.relative_to(settings.images_dir)}: {size} bytes ({exc})")

    mode = "DRY RUN - nothing written. " if dry_run else ""
    saved = (totals["before"] - totals["after"]) // 1024
    print(
        f"{mode}{totals['files']} files: {totals['reencoded']} re-encoded, "
        f"{totals['thumbs']} thumbnails created, {totals['skipped']} unreadable skipped"
        + ("" if dry_run else f", {saved} KB saved on re-encoded files")
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--dry-run", action="store_true", help="Only report what would change")
    parser.add_argument(
        "--max-kb", type=int, default=400, help="Re-encode full images heavier than this"
    )
    args = parser.parse_args()
    optimize(args.dry_run, args.max_kb)


if __name__ == "__main__":
    main()
