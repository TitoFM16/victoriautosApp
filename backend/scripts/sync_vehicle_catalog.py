"""Refresh the PostgreSQL vehicle catalog from official MinTransporte tables.

The refresh is transactional: existing active rows remain published unless every
download and workbook parse succeeds. Safe to schedule weekly; changed source rows
are upserted and rows removed by the source are marked inactive, not deleted.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import tempfile
from datetime import UTC, datetime
from pathlib import Path

import httpx
from collect_datos_abiertos_catalog import (
    CATALOG_URL,
    DEFAULT_QUERIES,
    aggregate_dataset,
    discover_datasets,
    is_vehicle_catalog_dataset,
    source_field_map,
)
from collect_mintransporte_catalog import (
    discover_publication_date,
    discover_xlsx_links,
    download_xlsx,
)

from victoriautos_backend.db.session import AsyncSessionLocal
from victoriautos_backend.services.catalog_ingestion import parse_mintransport_workbook
from victoriautos_backend.services.catalog_sync import MINTRANSPORTE_SOURCE, sync_catalog_rows

KNOWN_OPEN_DATASET_IDS = ("x9pp-pcn5", "aj2e-7jwg", "em3d-hmim")


def current_tables_url() -> str:
    year = datetime.now(tz=UTC).year
    return f"https://mintransporte.gov.co/documentos/1035/tablas-{year}/"


async def refresh(
    page_url: str,
    source_date: str | None,
    max_tables: int = 0,
    minimum_rows: int = 100_000,
    include_open_data: bool = True,
) -> int:
    rows = []
    headers = {"User-Agent": "VictoriautosCatalogSync/1.0"}
    with httpx.Client(headers=headers, follow_redirects=True, timeout=90.0) as client:
        source_date = source_date or discover_publication_date(client, page_url)
        links = discover_xlsx_links(client, page_url)
        if max_tables > 0:
            links = links[:max_tables]
        with tempfile.TemporaryDirectory(prefix="victoriautos-catalog-sync-") as directory:
            for index, (url, filename) in enumerate(links, start=1):
                path = Path(directory) / f"{index:02d}-{filename}"
                print(f"Downloading {filename}")
                download_xlsx(client, url, path)
                rows.extend(
                    parse_mintransport_workbook(
                        path,
                        source_dataset_id=f"{source_date}:{filename}",
                        source_updated_at=source_date,
                    )
                )
    if len(rows) < minimum_rows:
        raise ValueError(
            f"Parsed only {len(rows)} rows; refusing to publish fewer than {minimum_rows}"
        )

    async with AsyncSessionLocal() as db, db.begin():
        count = await sync_catalog_rows(
            db,
            rows,
            slug=MINTRANSPORTE_SOURCE["slug"],
            name=MINTRANSPORTE_SOURCE["name"],
            homepage_url=page_url,
            attribution=MINTRANSPORTE_SOURCE["attribution"],
            publish_to_forms=MINTRANSPORTE_SOURCE["publish_to_forms"],
            source_updated_at=source_date,
        )
    if include_open_data:
        count += await refresh_open_data()
    return count


def collect_open_data_snapshots():
    """Download privacy-safe grouped rows without holding a database transaction."""
    headers = {"User-Agent": "VictoriautosCatalogSync/1.0"}
    if token := os.environ.get("SOCRATA_APP_TOKEN"):
        headers["X-App-Token"] = token
    snapshots = []
    with httpx.Client(headers=headers, follow_redirects=True, timeout=60.0) as client:
        results = discover_datasets(client, DEFAULT_QUERIES)
        discovered_ids = {result.get("resource", {}).get("id") for result in results}
        for dataset_id in KNOWN_OPEN_DATASET_IDS:
            if dataset_id in discovered_ids:
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
        for result, fields in candidates:
            resource = result["resource"]
            try:
                rows = aggregate_dataset(client, result, fields)
            except httpx.HTTPStatusError as exc:
                print(f"Skipping Datos Abiertos {resource['id']}: HTTP {exc.response.status_code}")
                continue
            if rows:
                snapshots.append((resource, result.get("permalink", ""), rows))
    return snapshots


async def refresh_open_data() -> int:
    """Publish compatible territorial registration aggregates as independent sources."""
    snapshots = await asyncio.to_thread(collect_open_data_snapshots)
    total = 0
    for resource, permalink, rows in snapshots:
        async with AsyncSessionLocal() as db, db.begin():
            total += await sync_catalog_rows(
                db,
                rows,
                slug=f"datos-abiertos-{resource['id']}",
                name=resource.get("name", resource["id"]),
                homepage_url=permalink or f"https://www.datos.gov.co/d/{resource['id']}",
                attribution="Fuente: Portal de Datos Abiertos www.datos.gov.co",
                source_updated_at=resource.get("data_updated_at"),
            )
        print(f"Published {len(rows)} grouped rows from Datos Abiertos {resource['id']}")
    return total


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--page-url", default=current_tables_url())
    parser.add_argument(
        "--source-date",
        help="Override the official publication date discovered from the Ministry page",
    )
    parser.add_argument("--max-tables", type=int, default=0, help="Testing only; 0 means all")
    parser.add_argument(
        "--minimum-rows",
        type=int,
        default=100_000,
        help="Safety floor preventing a broken/partial source from replacing the active snapshot",
    )
    parser.add_argument(
        "--skip-datos-abiertos",
        action="store_true",
        help="Publish only the national MinTransporte baseline",
    )
    parser.add_argument(
        "--only-datos-abiertos",
        action="store_true",
        help="Refresh supplemental territorial sources without redownloading MinTransporte",
    )
    args = parser.parse_args()
    if args.only_datos_abiertos:
        count = asyncio.run(refresh_open_data())
    else:
        count = asyncio.run(
            refresh(
                args.page_url,
                args.source_date,
                args.max_tables,
                args.minimum_rows,
                include_open_data=not args.skip_datos_abiertos,
            )
        )
    print(f"Published {count} active source catalog rows")


if __name__ == "__main__":
    main()
