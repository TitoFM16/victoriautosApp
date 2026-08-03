"""add refreshable vehicle catalog

Revision ID: 71c46ef8ae21
Revises: 396dbfc88234
Create Date: 2026-08-03 12:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "71c46ef8ae21"
down_revision: str | Sequence[str] | None = "396dbfc88234"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "vehicle_catalog_sources",
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("homepage_url", sa.Text(), nullable=False),
        sa.Column("attribution", sa.Text(), nullable=False),
        sa.Column("source_updated_at", sa.String(length=40), nullable=True),
        sa.Column("last_success_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("item_count", sa.Integer(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_vehicle_catalog_sources_slug", "vehicle_catalog_sources", ["slug"], unique=True
    )
    op.create_table(
        "vehicle_catalog_items",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("external_key", sa.String(length=64), nullable=False),
        sa.Column("source_dataset_id", sa.String(length=300), nullable=False),
        sa.Column("source_record_id", sa.String(length=160), nullable=False),
        sa.Column("raw_vehicle_type", sa.String(length=120), nullable=False),
        sa.Column("form_type", sa.String(length=20), nullable=True),
        sa.Column("brand", sa.String(length=160), nullable=False),
        sa.Column("line", sa.String(length=300), nullable=False),
        sa.Column("version", sa.String(length=300), nullable=False),
        sa.Column("model_year", sa.Integer(), nullable=False),
        sa.Column("engine_cc", sa.Integer(), nullable=True),
        sa.Column("market_value_cop", sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column("observations", sa.Integer(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("sync_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "first_seen_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "last_seen_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["source_id"], ["vehicle_catalog_sources.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_id", "external_key", name="uq_catalog_items_source_key"),
    )
    op.create_index(
        "ix_catalog_items_form_lookup",
        "vehicle_catalog_items",
        ["active", "form_type", "brand", "line", "model_year"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_catalog_items_form_lookup", table_name="vehicle_catalog_items")
    op.drop_table("vehicle_catalog_items")
    op.drop_index("ix_vehicle_catalog_sources_slug", table_name="vehicle_catalog_sources")
    op.drop_table("vehicle_catalog_sources")
