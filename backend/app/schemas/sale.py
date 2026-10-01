from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.delivery_location import DeliveryLocationOut


class PerfumeSummary(BaseModel):
    id: int
    name: str
    brand: str
    image_url: str

    class Config:
        from_attributes = True


class AddressCreate(BaseModel):
    street: str
    number: str = ""
    city: str
    state: str = ""
    postal_code: str = ""
    country: str = "México"
    references: str = ""
    latitude: float | None = None
    longitude: float | None = None


class AddressOut(AddressCreate):
    id: int

    class Config:
        from_attributes = True


class SaleCreate(BaseModel):
    perfume_id: int
    buyer_name: str
    buyer_phone: str
    quantity: int = 1
    address: AddressCreate
    preferred_delivery_location_id: Optional[int] = None


class SaleOut(BaseModel):
    id: int
    folio: str
    perfume_id: int
    buyer_name: str
    buyer_phone: str
    quantity: int
    unit_price: float
    total: float
    status: str
    created_at: datetime
    address: AddressOut
    perfume: PerfumeSummary
    delivery_type: str
    preferred_delivery_location: Optional[DeliveryLocationOut] = None
    delivery_location: Optional[DeliveryLocationOut] = None
    delivery_scheduled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
