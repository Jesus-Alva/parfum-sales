"""Add a phone number to user profiles.

Revision ID: e81c4ad2076b
Revises: d4e9c6f2a031
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e81c4ad2076b"
down_revision: Union[str, None] = "d4e9c6f2a031"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(length=30), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "phone")
