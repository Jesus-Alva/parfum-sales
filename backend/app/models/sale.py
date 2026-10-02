from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    folio: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    perfume_id: Mapped[int] = mapped_column(ForeignKey("perfumes.id"), nullable=False)
    buyer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    buyer_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    total: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending_delivery")
    delivery_type: Mapped[str] = mapped_column(String(20), default="shipping", nullable=False)
    preferred_delivery_location_id: Mapped[int | None] = mapped_column(
        ForeignKey("delivery_locations.id", ondelete="SET NULL"), nullable=True
    )
    delivery_location_id: Mapped[int | None] = mapped_column(
        ForeignKey("delivery_locations.id", ondelete="SET NULL"), nullable=True
    )
    delivery_scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    perfume = relationship("Perfume")
    address = relationship("Address")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan", order_by="SaleItem.id")
    preferred_delivery_location = relationship("DeliveryLocation", foreign_keys=[preferred_delivery_location_id])
    delivery_location = relationship("DeliveryLocation", foreign_keys=[delivery_location_id])


class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    perfume_id: Mapped[int] = mapped_column(ForeignKey("perfumes.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)

    sale = relationship("Sale", back_populates="items")
    perfume = relationship("Perfume")
