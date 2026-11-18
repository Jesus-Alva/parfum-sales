from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, Float, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DeliveryLocation(Base):
    __tablename__ = "delivery_locations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(150), nullable=False)
    state: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    delivery_day: Mapped[str | None] = mapped_column(String(10), nullable=True)
    delivery_start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    delivery_end_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
