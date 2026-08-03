"""One-off script: copy the legacy `vehiculos` catalog table (a standalone
Postgres table used by the old Node app's /api/buscavehiculo) into this
project's `vehiculos` table.

Usage:
    uv run python scripts/migrate_vehicle_catalog.py \\
        --source "postgresql://server:password@localhost:5432/vehiculos_db"

Safe to re-run: rows that would violate the (tipo, marca, linea, version)
unique constraint are skipped rather than duplicated.
"""

import argparse
import asyncio

import asyncpg

from victoriautos_backend.core.config import settings


async def migrate(source_dsn: str) -> None:
    target_dsn = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")

    source_conn = await asyncpg.connect(source_dsn)
    target_conn = await asyncpg.connect(target_dsn)
    try:
        rows = await source_conn.fetch(
            "SELECT tipo, marca, linea, version, motor, fabricacion FROM vehiculos"
        )
        print(f"Fetched {len(rows)} rows from source.")

        inserted = 0
        for row in rows:
            result = await target_conn.execute(
                """
                INSERT INTO vehiculos (tipo, marca, linea, version, motor, fabricacion)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT ON CONSTRAINT uq_vehiculos_catalog_entry DO NOTHING
                """,
                row["tipo"],
                row["marca"],
                row["linea"],
                row["version"],
                row["motor"],
                row["fabricacion"],
            )
            if result.endswith(" 1"):
                inserted += 1
        print(f"Inserted {inserted} new rows ({len(rows) - inserted} already present or skipped).")
    finally:
        await source_conn.close()
        await target_conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        required=True,
        help="Source Postgres DSN for the legacy vehiculos_db",
    )
    args = parser.parse_args()
    asyncio.run(migrate(args.source))


if __name__ == "__main__":
    main()
