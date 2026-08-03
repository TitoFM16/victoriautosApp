"""Collect Colombia's nationwide MinTransporte base-gravable vehicle tables.

The Ministry publishes these XLSX tables for public download. They cover vehicle
class, brand, line/trim, engine displacement, model year, and tax reference value.

Example:
    uv run python scripts/collect_mintransporte_catalog.py \
        --output data/catalog/mintransporte_sources.csv \
        --merged-output data/catalog/mintransporte_merged.csv
"""

from __future__ import annotations

import argparse
import re
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

import httpx

from victoriautos_backend.services.catalog_ingestion import (
    extract_mintransport_publication_date,
    merge_catalog_rows,
    parse_mintransport_workbook,
    write_catalog_csv,
    write_merged_csv,
)

DEFAULT_PAGE_URL = "https://mintransporte.gov.co/documentos/1035/tablas-2026/"
MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024


class DownloadLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            self._href = dict(attrs).get("href")
            self._text = []

    def handle_data(self, data: str) -> None:
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._href is not None:
            self.links.append((self._href, " ".join(self._text).strip()))
            self._href = None
            self._text = []


def discover_xlsx_links(client: httpx.Client, page_url: str) -> list[tuple[str, str]]:
    _require_mintransport_url(page_url)
    response = client.get(page_url)
    response.raise_for_status()
    parser = DownloadLinkParser()
    parser.feed(response.text)
    links: dict[str, str] = {}
    for href, text in parser.links:
        if ".xlsx" not in text.casefold():
            continue
        url = urljoin(page_url, href)
        _require_mintransport_url(url)
        links[url] = re.sub(r"[^A-Za-z0-9._-]+", "-", text).strip("-")
    if not links:
        raise ValueError("No XLSX table links were found on the MinTransporte page")
    return sorted(links.items(), key=lambda item: item[1])


def discover_publication_date(client: httpx.Client, page_url: str) -> str:
    _require_mintransport_url(page_url)
    response = client.get(page_url)
    response.raise_for_status()
    return extract_mintransport_publication_date(response.text)


def download_xlsx(client: httpx.Client, url: str, destination: Path) -> None:
    _require_mintransport_url(url)
    total = 0
    with client.stream("GET", url) as response:
        response.raise_for_status()
        _require_mintransport_url(str(response.url))
        with destination.open("wb") as output:
            for chunk in response.iter_bytes():
                total += len(chunk)
                if total > MAX_DOWNLOAD_BYTES:
                    raise ValueError("A MinTransporte table exceeded the 25 MiB safety limit")
                output.write(chunk)
    with destination.open("rb") as downloaded:
        if downloaded.read(2) != b"PK":
            raise ValueError(f"MinTransporte did not return an XLSX file for {url}")


def _require_mintransport_url(url: str) -> None:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    if parsed.scheme != "https" or not (
        hostname == "mintransporte.gov.co" or hostname.endswith(".mintransporte.gov.co")
    ):
        raise ValueError("MinTransporte URLs must use HTTPS on mintransporte.gov.co")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--page-url", default=DEFAULT_PAGE_URL)
    parser.add_argument("--source-date", help="Override the official publication date")
    parser.add_argument("--output", type=Path, required=True, help="Source-preserving CSV")
    parser.add_argument("--merged-output", type=Path, help="Optional merged form-ready CSV")
    parser.add_argument("--max-tables", type=int, default=0, help="0 means every XLSX table")
    args = parser.parse_args()

    headers = {"User-Agent": "VictoriautosCatalogCollector/1.0"}
    rows = []
    with httpx.Client(headers=headers, follow_redirects=True, timeout=90.0) as client:
        source_date = args.source_date or discover_publication_date(client, args.page_url)
        links = discover_xlsx_links(client, args.page_url)
        if args.max_tables > 0:
            links = links[: args.max_tables]
        with tempfile.TemporaryDirectory(prefix="victoriautos-mintransporte-") as temp_directory:
            for index, (url, filename) in enumerate(links, start=1):
                local_path = Path(temp_directory) / f"{index:02d}-{filename}"
                print(f"Downloading {filename}")
                download_xlsx(client, url, local_path)
                rows.extend(
                    parse_mintransport_workbook(
                        local_path,
                        source_dataset_id=f"{source_date}:{filename}",
                        source_updated_at=source_date,
                    )
                )

    count = write_catalog_csv(args.output, rows)
    print(f"Wrote {count} MinTransporte source rows from {len(links)} tables to {args.output}")
    if args.merged_output:
        merged = merge_catalog_rows(rows)
        merged_count = write_merged_csv(args.merged_output, merged)
        print(f"Wrote {merged_count} merged form choices to {args.merged_output}")


if __name__ == "__main__":
    main()
