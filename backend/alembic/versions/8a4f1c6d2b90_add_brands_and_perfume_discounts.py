"""Add brand registry and perfume percentage discounts.

Revision ID: 8a4f1c6d2b90
Revises: 6f8b2c9a1d04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8a4f1c6d2b90"
down_revision: Union[str, None] = "6f8b2c9a1d04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "brands",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("logo_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name", name="uq_brands_name"),
    )
    op.create_index("ix_brands_id", "brands", ["id"])
    op.add_column("perfumes", sa.Column("brand_id", sa.Integer(), nullable=True))
    op.add_column(
        "perfumes",
        sa.Column("discount_percent", sa.Float(), server_default="0", nullable=False),
    )
    op.create_index("ix_perfumes_brand_id", "perfumes", ["brand_id"])
    op.create_foreign_key(
        "fk_perfumes_brand_id_brands",
        "perfumes",
        "brands",
        ["brand_id"],
        ["id"],
        ondelete="SET NULL",
    )

    connection = op.get_bind()
    rows = connection.execute(sa.text("SELECT id, brand FROM perfumes ORDER BY id")).all()
    brand_ids: dict[str, tuple[int, str]] = {}
    for perfume_id, raw_name in rows:
        name = (raw_name or "").strip()
        if not name:
            continue
        normalized = name.casefold()
        if normalized not in brand_ids:
            connection.execute(
                sa.text("INSERT INTO brands (name, logo_url) VALUES (:name, '') ON CONFLICT (name) DO NOTHING"),
                {"name": name},
            )
            brand_id = connection.execute(
                sa.text("SELECT id FROM brands WHERE name = :name"), {"name": name}
            ).scalar_one()
            brand_ids[normalized] = (brand_id, name)
        brand_id, canonical_name = brand_ids[normalized]
        connection.execute(
            sa.text("UPDATE perfumes SET brand_id = :brand_id, brand = :name WHERE id = :perfume_id"),
            {"brand_id": brand_id, "name": canonical_name, "perfume_id": perfume_id},
        )


def downgrade() -> None:
    op.drop_constraint("fk_perfumes_brand_id_brands", "perfumes", type_="foreignkey")
    op.drop_index("ix_perfumes_brand_id", table_name="perfumes")
    op.drop_column("perfumes", "discount_percent")
    op.drop_column("perfumes", "brand_id")
    op.drop_index("ix_brands_id", table_name="brands")
    op.drop_table("brands")
