"""Save a reusable address on each user account.

Revision ID: 9e2a71f4c603
Revises: c02d6ebca916
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9e2a71f4c603"
down_revision: Union[str, None] = "c02d6ebca916"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("address_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_users_address_id_addresses",
        "users",
        "addresses",
        ["address_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_users_address_id_addresses", "users", type_="foreignkey")
    op.drop_column("users", "address_id")
