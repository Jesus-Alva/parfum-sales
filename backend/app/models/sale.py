from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from datetime import datetime


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True)
    folio: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    perfume_id: Mapped[int] = mapped_column(ForeignKey("perfumes.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    buyer_name: Mapped[str] = mapped_column(String(150))
    phone: Mapped[str] = mapped_column(String(20))
    address: Mapped[str] = mapped_column(String(300))
    price: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    perfume = relationship("Perfume", back_populates="sales")
    user = relationship("User", back_populates="sales")