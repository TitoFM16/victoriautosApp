"""Compare normalized Fasecolda and MinTransporte catalog CSV exports.

The report distinguishes exact base-line matches, prefix matches, and full
reference matches because MinTransporte commonly stores trim details inside its
single LINEA field while Fasecolda splits them into Referencia1/2/3.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import unicodedata
from pathlib import Path
from typing import Any


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as source_file:
        return list(csv.DictReader(source_file))


def canonical_text(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.upper())
    text = "".join(character for character in text if not unicodedata.combining(character))
    text = re.sub(r"\[[^]]*]", " ", text)
    text = re.sub(r"\(\s*LINEA BASE ESTANDAR\s*\)", " ", text)
    return re.sub(r"[^A-Z0-9]+", " ", text).strip()


def canonical_brand(value: str) -> str:
    return canonical_text(value).replace(" ", "")


def compare(fasecolda: list[dict[str, str]], ministry: list[dict[str, str]]) -> dict[str, Any]:
    fasecolda_brands = {row["brand"] for row in fasecolda}
    ministry_brands = {row["brand"] for row in ministry}
    canonical_fasecolda_brands = {canonical_brand(brand) for brand in fasecolda_brands}
    canonical_ministry_brands = {canonical_brand(brand) for brand in ministry_brands}
    fasecolda_lines = {(row["brand"], row["line"]) for row in fasecolda}
    ministry_lines = {(row["brand"], row["line"]) for row in ministry}
    ministry_by_brand: dict[str, set[str]] = {}
    for brand, line in ministry_lines:
        ministry_by_brand.setdefault(brand, set()).add(line)

    exact_lines = fasecolda_lines & ministry_lines
    prefix_lines = {
        (brand, line)
        for brand, line in fasecolda_lines
        if any(
            ministry_line == line or ministry_line.startswith(f"{line} ")
            for ministry_line in ministry_by_brand.get(brand, set())
        )
    }
    fasecolda_full_lines = {
        (row["brand"], " ".join(part for part in (row["line"], row["version"]) if part))
        for row in fasecolda
    }
    exact_full_lines = fasecolda_full_lines & ministry_lines

    canonical_ministry_by_brand: dict[str, set[str]] = {}
    for brand, line in ministry_lines:
        canonical_ministry_by_brand.setdefault(canonical_brand(brand), set()).add(
            canonical_text(line)
        )
    canonical_fasecolda_lines = {
        (canonical_brand(brand), canonical_text(line)) for brand, line in fasecolda_lines
    }
    canonical_prefix_lines = {
        (brand, line)
        for brand, line in canonical_fasecolda_lines
        if line
        and any(
            ministry_line == line or ministry_line.startswith(f"{line} ")
            for ministry_line in canonical_ministry_by_brand.get(brand, set())
        )
    }
    canonical_fasecolda_full_lines = {
        (
            canonical_brand(row["brand"]),
            canonical_text(" ".join(part for part in (row["line"], row["version"]) if part)),
        )
        for row in fasecolda
    }
    canonical_ministry_lines = {
        (canonical_brand(brand), canonical_text(line)) for brand, line in ministry_lines
    }
    canonical_full_lines = canonical_fasecolda_full_lines & canonical_ministry_lines

    fasecolda_years = {(row["brand"], row["line"], row["model_year"]) for row in fasecolda}
    ministry_years = {(row["brand"], row["line"], row["model_year"]) for row in ministry}
    exact_years = fasecolda_years & ministry_years

    def percentage(numerator: int, denominator: int) -> float:
        return round(100 * numerator / denominator, 2) if denominator else 0.0

    unmatched = sorted(fasecolda_lines - prefix_lines)
    return {
        "fasecolda": {
            "rows": len(fasecolda),
            "references": len({row["source_record_id"] for row in fasecolda}),
            "brands": len(fasecolda_brands),
            "brand_lines": len(fasecolda_lines),
            "brand_line_years": len(fasecolda_years),
        },
        "mintransporte": {
            "rows": len(ministry),
            "references": len(
                {(row["source_dataset_id"], row["source_record_id"]) for row in ministry}
            ),
            "brands": len(ministry_brands),
            "brand_lines": len(ministry_lines),
            "brand_line_years": len(ministry_years),
        },
        "overlap": {
            "brands": len(fasecolda_brands & ministry_brands),
            "fasecolda_brand_coverage_pct": percentage(
                len(fasecolda_brands & ministry_brands), len(fasecolda_brands)
            ),
            "canonical_brands": len(canonical_fasecolda_brands & canonical_ministry_brands),
            "fasecolda_canonical_brand_coverage_pct": percentage(
                len(canonical_fasecolda_brands & canonical_ministry_brands),
                len(canonical_fasecolda_brands),
            ),
            "exact_base_lines": len(exact_lines),
            "fasecolda_exact_base_line_coverage_pct": percentage(
                len(exact_lines), len(fasecolda_lines)
            ),
            "base_or_ministry_prefix_lines": len(prefix_lines),
            "fasecolda_prefix_line_coverage_pct": percentage(
                len(prefix_lines), len(fasecolda_lines)
            ),
            "exact_full_references": len(exact_full_lines),
            "fasecolda_exact_full_reference_coverage_pct": percentage(
                len(exact_full_lines), len(fasecolda_full_lines)
            ),
            "canonical_base_or_ministry_prefix_lines": len(canonical_prefix_lines),
            "fasecolda_canonical_prefix_line_coverage_pct": percentage(
                len(canonical_prefix_lines), len(canonical_fasecolda_lines)
            ),
            "canonical_exact_full_references": len(canonical_full_lines),
            "fasecolda_canonical_exact_full_reference_coverage_pct": percentage(
                len(canonical_full_lines), len(canonical_fasecolda_full_lines)
            ),
            "exact_brand_line_years": len(exact_years),
            "fasecolda_exact_brand_line_year_coverage_pct": percentage(
                len(exact_years), len(fasecolda_years)
            ),
        },
        "sample_unmatched_fasecolda_base_lines": [
            {"brand": brand, "line": line} for brand, line in unmatched[:50]
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fasecolda", type=Path, required=True)
    parser.add_argument("--mintransporte", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    report = compare(read_rows(args.fasecolda), read_rows(args.mintransporte))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
