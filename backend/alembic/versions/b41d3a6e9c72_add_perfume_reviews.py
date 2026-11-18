"""Add user ratings and comments for perfumes."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b41d3a6e9c72"
down_revision: Union[str, None] = "8a4f1c6d2b90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "perfume_reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("perfume_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["perfume_id"], ["perfumes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("perfume_id", "user_id", name="uq_perfume_reviews_user_perfume"),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="ck_perfume_reviews_rating_range"),
    )
    op.create_index("ix_perfume_reviews_perfume_id", "perfume_reviews", ["perfume_id"])
    op.create_index("ix_perfume_reviews_user_id", "perfume_reviews", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_perfume_reviews_user_id", table_name="perfume_reviews")
    op.drop_index("ix_perfume_reviews_perfume_id", table_name="perfume_reviews")
    op.drop_table("perfume_reviews")
