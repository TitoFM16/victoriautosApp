"""Normalize an authorized local Fasecolda XLSX export for catalog review.

This script does not access Fasecolda's website. Fasecolda's site-wide terms
require prior written authorization for reproduction or storage of its content.
Only use an XLSX file Victoriautos is permitted to process, and do not publish
the resulting CSV unless the authorization permits redistribution.

Example:
    uv run python scripts/import_fasecolda_catalog.py \
        --source ~/Downloads/GuiaValores.xlsx \
        --output data/catalog/fasecolda.csv
"""

from __future__ import annotations

import argparse
from pathlib import Path

from victoriautos_backend.services.catalog_ingestion import (
    parse_fasecolda_csv,
    parse_fasecolda_workbook,
    write_catalog_csv,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source", type=Path, required=True, help="Authorized local XLSX or historical CSV file"
    )
    parser.add_argument("--output", type=Path, required=True, help="Normalized output CSV")
    args = parser.parse_args()

    workbook_path = args.source.expanduser().resolve()
    suffix = workbook_path.suffix.casefold()
    if suffix == ".xlsx":
        rows = parse_fasecolda_workbook(workbook_path)
    elif suffix == ".csv":
        rows = parse_fasecolda_csv(workbook_path)
    else:
        parser.error("--source must be an .xlsx or .csv file")
    count = write_catalog_csv(args.output, rows)
    print(f"Wrote {count} normalized Fasecolda catalog rows to {args.output}")


if __name__ == "__main__":
    main()
