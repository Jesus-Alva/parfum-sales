"""Add regular and decanter perfume classification."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f2a7c9d1e604"
down_revision: Union[str, None] = "e81c4ad2076b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "perfumes",
        sa.Column("classification", sa.String(length=30), nullable=False, server_default="regular"),
    )
    op.create_index("ix_perfumes_classification", "perfumes", ["classification"])


def downgrade() -> None:
    op.drop_index("ix_perfumes_classification", table_name="perfumes")
    op.drop_column("perfumes", "classification")
