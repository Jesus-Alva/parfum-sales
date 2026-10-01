"""Add delivery locations and order workflow.

Revision ID: 5c61a4b9d012
Revises: ca1b1920f1fd
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5c61a4b9d012"
down_revision: Union[str, None] = "ca1b1920f1fd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "delivery_locations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("address", sa.String(500), nullable=False),
        sa.Column("city", sa.String(150), nullable=False),
        sa.Column("state", sa.String(150), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("notes", sa.String(500), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_delivery_locations_id"), "delivery_locations", ["id"], unique=False)
    op.add_column("sales", sa.Column("delivery_type", sa.String(20), nullable=False, server_default="shipping"))
    op.add_column("sales", sa.Column("preferred_delivery_location_id", sa.Integer(), nullable=True))
    op.add_column("sales", sa.Column("delivery_location_id", sa.Integer(), nullable=True))
    op.add_column("sales", sa.Column("delivery_scheduled_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key("fk_sales_preferred_delivery_location", "sales", "delivery_locations", ["preferred_delivery_location_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_sales_delivery_location", "sales", "delivery_locations", ["delivery_location_id"], ["id"], ondelete="SET NULL")
    op.add_column("addresses", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("addresses", sa.Column("longitude", sa.Float(), nullable=True))
    # Prior records predate delivery tracking and were already treated as sales.
    op.execute("UPDATE sales SET status = 'delivered' WHERE status <> 'delivered'")


def downgrade() -> None:
    op.drop_column("addresses", "longitude")
    op.drop_column("addresses", "latitude")
    op.drop_constraint("fk_sales_delivery_location", "sales", type_="foreignkey")
    op.drop_constraint("fk_sales_preferred_delivery_location", "sales", type_="foreignkey")
    op.drop_column("sales", "delivery_scheduled_at")
    op.drop_column("sales", "delivery_location_id")
    op.drop_column("sales", "preferred_delivery_location_id")
    op.drop_column("sales", "delivery_type")
    op.drop_index(op.f("ix_delivery_locations_id"), table_name="delivery_locations")
    op.drop_table("delivery_locations")
