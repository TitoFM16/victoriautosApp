"""Merge normalized catalog CSV exports into one form-ready dataset.

Example:
    uv run python scripts/merge_vehicle_catalog_exports.py \
        data/catalog/mintransporte_sources.csv \
        data/catalog/datos_abiertos_sources.csv \
        --output data/catalog/colombia_vehicle_catalog.csv
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

from victoriautos_backend.services.catalog_ingestion import merge_catalog_rows, write_merged_csv


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sources", nargs="+", type=Path, help="Normalized source CSV files")
    parser.add_argument("--output", type=Path, required=True, help="Merged form-ready CSV")
    args = parser.parse_args()

    rows = []
    for source in args.sources:
        with source.open(encoding="utf-8-sig", newline="") as source_file:
            rows.extend(csv.DictReader(source_file))
    merged = merge_catalog_rows(rows)
    count = write_merged_csv(args.output, merged)
    print(f"Wrote {count} merged form choices from {len(args.sources)} source files")


if __name__ == "__main__":
    main()
