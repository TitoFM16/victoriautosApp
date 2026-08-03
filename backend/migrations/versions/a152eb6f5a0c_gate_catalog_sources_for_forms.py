"""gate catalog sources for forms

Revision ID: a152eb6f5a0c
Revises: 71c46ef8ae21
Create Date: 2026-08-03 15:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a152eb6f5a0c"
down_revision: str | Sequence[str] | None = "71c46ef8ae21"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "vehicle_catalog_sources",
        sa.Column(
            "publish_to_forms", sa.Boolean(), server_default=sa.text("false"), nullable=False
        ),
    )
    op.execute(
        "UPDATE vehicle_catalog_sources SET publish_to_forms = true "
        "WHERE slug = 'mintransporte-base-gravable'"
    )
    op.alter_column("vehicle_catalog_sources", "publish_to_forms", server_default=None)


def downgrade() -> None:
    op.drop_column("vehicle_catalog_sources", "publish_to_forms")
