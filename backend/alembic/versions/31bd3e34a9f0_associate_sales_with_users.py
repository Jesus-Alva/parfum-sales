"""Associate orders with customer accounts.

Revision ID: 31bd3e34a9f0
Revises: 9e2a71f4c603
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "31bd3e34a9f0"
down_revision: Union[str, None] = "9e2a71f4c603"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("sales", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_sales_user_id_users",
        "sales",
        "users",
        ["user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(op.f("ix_sales_user_id"), "sales", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_sales_user_id"), table_name="sales")
    op.drop_constraint("fk_sales_user_id_users", "sales", type_="foreignkey")
    op.drop_column("sales", "user_id")
