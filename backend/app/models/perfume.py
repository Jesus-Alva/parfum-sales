from sqlalchemy import String, Float, Integer, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from datetime import datetime


class Perfume(Base):
    __tablename__ = "perfumes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), index=True)
    brand: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes_top: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes_heart: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes_base: Mapped[str | None] = mapped_column(String(200), nullable=True)
    concentration: Mapped[str] = mapped_column(String(50), default="EDP")
    volume_ml: Mapped[int] = mapped_column(Integer, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=func.now())

    sales = relationship("Sale", back_populates="perfume")