"""Add standard delivery schedules to delivery locations.

Revision ID: d4e9c6f2a031
Revises: b41d3a6e9c72
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e9c6f2a031"
down_revision: Union[str, None] = "b41d3a6e9c72"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("delivery_locations", sa.Column("delivery_day", sa.String(length=10), nullable=True))
    op.add_column("delivery_locations", sa.Column("delivery_start_time", sa.Time(), nullable=True))
    op.add_column("delivery_locations", sa.Column("delivery_end_time", sa.Time(), nullable=True))


def downgrade() -> None:
    op.drop_column("delivery_locations", "delivery_end_time")
    op.drop_column("delivery_locations", "delivery_start_time")
    op.drop_column("delivery_locations", "delivery_day")
