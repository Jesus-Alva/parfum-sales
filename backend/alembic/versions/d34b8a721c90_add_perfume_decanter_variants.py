"""Add independently priced and stocked decanter variants to perfumes."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d34b8a721c90"
down_revision: Union[str, None] = "f2a7c9d1e604"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("perfumes", sa.Column("parent_perfume_id", sa.Integer(), nullable=True))
    op.add_column("perfumes", sa.Column("is_enabled", sa.Boolean(), server_default=sa.true(), nullable=False))
    op.create_index("ix_perfumes_parent_perfume_id", "perfumes", ["parent_perfume_id"])
    op.create_foreign_key(
        "fk_perfumes_parent_perfume_id_perfumes",
        "perfumes",
        "perfumes",
        ["parent_perfume_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_unique_constraint(
        "uq_perfume_decanter_parent_size",
        "perfumes",
        ["parent_perfume_id", "volume_ml"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_perfume_decanter_parent_size", "perfumes", type_="unique")
    op.drop_constraint("fk_perfumes_parent_perfume_id_perfumes", "perfumes", type_="foreignkey")
    op.drop_index("ix_perfumes_parent_perfume_id", table_name="perfumes")
    op.drop_column("perfumes", "is_enabled")
    op.drop_column("perfumes", "parent_perfume_id")
