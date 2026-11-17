from sqlalchemy import String, Float, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class Perfume(Base):
    __tablename__ = "perfumes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    brand: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    brand_id: Mapped[int | None] = mapped_column(ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    gender: Mapped[str] = mapped_column(String(50), default="unisex", index=True)
    family: Mapped[str] = mapped_column(String(100), default="", index=True)
    notes: Mapped[str] = mapped_column(String(500), default="")
    volume_ml: Mapped[int] = mapped_column(Integer, default=100)
    price: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    discount_percent: Mapped[float] = mapped_column(Float, default=0, server_default="0", nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    stock: Mapped[int] = mapped_column(Integer, default=0, index=True)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    tipo: Mapped[str] = mapped_column(String(100), default="", index=True)
    perfil: Mapped[str] = mapped_column(Text, default="")
    estilo: Mapped[str] = mapped_column(String(255), default="")
    uso: Mapped[str] = mapped_column(String(255), default="")
    presentacion: Mapped[str] = mapped_column(String(255), default="")

    images = relationship(
        "PerfumeImage",
        back_populates="perfume",
        cascade="all, delete-orphan",
        order_by="PerfumeImage.position",
        lazy="selectin",   # carga eager para evitar N+1
    )

    brand_record = relationship("Brand", back_populates="perfumes", lazy="joined")

    @property
    def discounted_price(self) -> float:
        discount = max(0.0, min(100.0, float(self.discount_percent or 0)))
        return round(float(self.price) * (1 - discount / 100), 2)

    @property
    def brand_logo_url(self) -> str:
        return self.brand_record.logo_url if self.brand_record else ""
