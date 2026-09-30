from sqlalchemy import String, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class PerfumeImage(Base):
    __tablename__ = "perfume_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    perfume_id: Mapped[int] = mapped_column(
        ForeignKey("perfumes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0)  # orden
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    perfume = relationship("Perfume", back_populates="images")