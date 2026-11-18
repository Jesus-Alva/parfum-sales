from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PerfumeReview(Base):
    __tablename__ = "perfume_reviews"
    __table_args__ = (
        UniqueConstraint("perfume_id", "user_id", name="uq_perfume_reviews_user_perfume"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_perfume_reviews_rating_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    perfume_id: Mapped[int] = mapped_column(
        ForeignKey("perfumes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    perfume = relationship("Perfume", back_populates="reviews")
    user = relationship("User", back_populates="perfume_reviews")

    @property
    def author_name(self) -> str:
        return self.user.full_name
