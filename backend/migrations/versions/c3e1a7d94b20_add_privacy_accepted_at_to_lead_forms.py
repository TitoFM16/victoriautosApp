"""add privacy_accepted_at to lead forms

Records when a lead accepted the data-processing policy (Ley 1581 de 2012).
Nullable: rows imported from the legacy app predate the consent checkbox.

Revision ID: c3e1a7d94b20
Revises: a152eb6f5a0c
Create Date: 2026-10-06 03:45:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c3e1a7d94b20"
down_revision: str | Sequence[str] | None = "a152eb6f5a0c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLES = ("compra_forms", "interes_forms", "ofertas_forms")


def upgrade() -> None:
    for table in TABLES:
        op.add_column(
            table,
            sa.Column("privacy_accepted_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    for table in TABLES:
        op.drop_column(table, "privacy_accepted_at")
