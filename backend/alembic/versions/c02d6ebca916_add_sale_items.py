"""Add multiple perfume items to each sale/order.

Revision ID: c02d6ebca916
Revises: 5c61a4b9d012
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c02d6ebca916"
down_revision: Union[str, None] = "5c61a4b9d012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sale_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sale_id", sa.Integer(), nullable=False),
        sa.Column("perfume_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["sale_id"], ["sales.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["perfume_id"], ["perfumes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sale_items_id"), "sale_items", ["id"], unique=False)
    op.create_index(op.f("ix_sale_items_sale_id"), "sale_items", ["sale_id"], unique=False)
    op.execute(
        """
        INSERT INTO sale_items (sale_id, perfume_id, quantity, unit_price)
        SELECT id, perfume_id, quantity, unit_price FROM sales
        """
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_sale_items_sale_id"), table_name="sale_items")
    op.drop_index(op.f("ix_sale_items_id"), table_name="sale_items")
    op.drop_table("sale_items")
