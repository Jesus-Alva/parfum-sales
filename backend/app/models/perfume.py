from sqlalchemy import String, Float, Integer, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class Perfume(Base):
    __tablename__ = "perfumes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    brand: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    gender: Mapped[str] = mapped_column(String(50), default="unisex")  # masculine/feminine/unisex
    family: Mapped[str] = mapped_column(String(100), default="")       # amaderado, cítrico, etc.
    notes: Mapped[str] = mapped_column(String(500), default="")
    volume_ml: Mapped[int] = mapped_column(Integer, default=100)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    images = relationship(
        "PerfumeImage",
        back_populates="perfume",
        cascade="all, delete-orphan",
        order_by="PerfumeImage.position",
        lazy="selectin",   # carga eager para evitar N+1
    )