"""Discover and aggregate Colombian open-data vehicle catalog datasets.

The collector uses the public Socrata Catalog and SODA APIs. It only requests
grouped brand/line/model-year catalog fields; it never downloads plates, VINs,
owner data, or complete vehicle-level records.

Example:
    uv run python scripts/collect_datos_abiertos_catalog.py \
        --output data/catalog/datos_abiertos_sources.csv \
        --merged-output data/catalog/datos_abiertos_merged.csv
"""

from __future__ import annotations

import argparse
import os
import re
from collections.abc import Iterable
from pathlib import Path
from typing import Any

import httpx

from victoriautos_backend.services.catalog_ingestion import (
    find_semantic_fields,
    is_vehicle_catalog_dataset,
    merge_catalog_rows,
    normalize_catalog_text,
    parse_model_year,
    write_catalog_csv,
    write_merged_csv,
)

CATALOG_URL = "https://api.us.socrata.com/api/catalog/v1"
DATA_URL = "https://www.datos.gov.co/resource/{dataset_id}.json"
DEFAULT_QUERIES = (
    "parque automotor",
    "vehiculos matriculados",
    "registro vehiculos",
    "vehiculos marca linea modelo",
    "vehiculos marca referencia modelo",
    "marca linea modelo vehiculo",
)
FIELD_ID_PATTERN = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")


def discover_datasets(client: httpx.Client, queries: Iterable[str]) -> list[dict[str, Any]]:
    discovered: dict[str, dict[str, Any]] = {}
    for query in queries:
        response = client.get(
            CATALOG_URL,
            params={
                "q": query,
                "search_context": "www.datos.gov.co",
                "limit": 100,
            },
        )
        response.raise_for_status()
        for result in response.json().get("results", []):
            resource = result.get("resource", {})
            dataset_id = resource.get("id")
            if dataset_id and resource.get("type") == "dataset":
                discovered[dataset_id] = result
    return list(discovered.values())


def source_field_map(result: dict[str, Any]) -> dict[str, str] | None:
    resource = result.get("resource", {})
    field_ids = resource.get("columns_field_name", [])
    labels = resource.get("columns_name", [])
    if len(field_ids) != len(labels):
        return None
    try:
        fields = find_semantic_fields(
            list(zip(field_ids, labels, strict=True)),
            required=("brand", "line", "model_year"),
        )
    except ValueError:
        return None
    if not all(FIELD_ID_PATTERN.fullmatch(field_id) for field_id in fields.values()):
        return None
    return fields


def aggregate_dataset(
    client: httpx.Client,
    result: dict[str, Any],
    fields: dict[str, str],
) -> list[dict[str, Any]]:
    resource = result["resource"]
    dataset_id = resource["id"]
    selected = [
        f"{fields['brand']} as brand",
        f"{fields['line']} as line",
        f"{fields['model_year']} as model_year",
    ]
    grouped = [fields["brand"], fields["line"], fields["model_year"]]
    for semantic in ("vehicle_type", "version", "engine_cc"):
        if semantic in fields:
            selected.append(f"{fields[semantic]} as {semantic}")
            grouped.append(fields[semantic])
    if observations_field := fields.get("observations"):
        selected.append(f"sum({observations_field}) as observations")
    else:
        selected.append("count(*) as observations")
    where = " AND ".join(f"{field} IS NOT NULL" for field in grouped[:3])

    rows: list[dict[str, Any]] = []
    offset = 0
    page_size = 50_000
    while True:
        response = client.get(
            DATA_URL.format(dataset_id=dataset_id),
            params={
                "$select": ", ".join(selected),
                "$where": where,
                "$group": ", ".join(grouped),
                "$limit": page_size,
                "$offset": offset,
            },
        )
        response.raise_for_status()
        page = response.json()
        for item in page:
            year = parse_model_year(item.get("model_year"))
            brand = normalize_catalog_text(item.get("brand"))
            line = normalize_catalog_text(item.get("line"))
            if year is None or not brand or not line:
                continue
            rows.append(
                {
                    "source": "datos.gov.co",
                    "source_dataset_id": dataset_id,
                    "source_record_id": "",
                    "source_updated_at": resource.get("data_updated_at", ""),
                    "vehicle_type": normalize_catalog_text(item.get("vehicle_type")),
                    "brand": brand,
                    "line": line,
                    "version": normalize_catalog_text(item.get("version")),
                    "model_year": year,
                    "engine_cc": normalize_catalog_text(item.get("engine_cc")),
                    "market_value_cop": "",
                    "observations": item.get("observations", ""),
                }
            )
        if len(page) < page_size:
            break
        offset += page_size
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, help="Source-preserving CSV")
    parser.add_argument("--merged-output", type=Path, help="Optional form-ready merged CSV")
    parser.add_argument("--query", action="append", default=[], help="Additional discovery query")
    parser.add_argument(
        "--include-dataset",
        action="append",
        default=[],
        help="Explicit Socrata dataset ID to include when it matches the required schema",
    )
    parser.add_argument("--max-sources", type=int, default=0, help="0 means all matching sources")
    parser.add_argument("--list-only", action="store_true", help="Print matching sources only")
    args = parser.parse_args()

    headers = {"User-Agent": "VictoriautosCatalogCollector/1.0"}
    if token := os.environ.get("SOCRATA_APP_TOKEN"):
        headers["X-App-Token"] = token
    with httpx.Client(headers=headers, follow_redirects=True, timeout=60.0) as client:
        results = discover_datasets(client, (*DEFAULT_QUERIES, *args.query))
        known_ids = {result["resource"]["id"] for result in results}
        for dataset_id in args.include_dataset:
            if dataset_id in known_ids:
                continue
            response = client.get(
                CATALOG_URL,
                params={
                    "q": dataset_id,
                    "search_context": "www.datos.gov.co",
                    "limit": 10,
                },
            )
            response.raise_for_status()
            results.extend(
                result
                for result in response.json().get("results", [])
                if result.get("resource", {}).get("id") == dataset_id
            )

        candidates = [
            (result, fields)
            for result in results
            if is_vehicle_catalog_dataset(result)
            if (fields := source_field_map(result)) is not None
        ]
        candidates.sort(
            key=lambda item: item[0]["resource"].get("data_updated_at", ""),
            reverse=True,
        )
        if args.max_sources > 0:
            candidates = candidates[: args.max_sources]

        for result, _fields in candidates:
            resource = result["resource"]
            print(f"{resource['id']}\t{resource.get('name', '')}\t{result.get('permalink', '')}")
        if args.list_only:
            return
        if args.output is None:
            parser.error("--output is required unless --list-only is used")

        rows: list[dict[str, Any]] = []
        for result, fields in candidates:
            try:
                rows.extend(aggregate_dataset(client, result, fields))
            except httpx.HTTPStatusError as exc:
                dataset_id = result["resource"]["id"]
                print(f"Skipping {dataset_id}: Socrata query failed ({exc.response.status_code})")

    count = write_catalog_csv(args.output, rows)
    print(f"Wrote {count} source catalog rows from {len(candidates)} datasets to {args.output}")
    if args.merged_output:
        merged = merge_catalog_rows(rows)
        merged_count = write_merged_csv(args.merged_output, merged)
        print(f"Wrote {merged_count} merged form choices to {args.merged_output}")


if __name__ == "__main__":
    main()
