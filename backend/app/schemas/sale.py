from pydantic import BaseModel, Field, model_validator
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


class SaleItemCreate(BaseModel):
    perfume_id: int
    quantity: int = Field(default=1, gt=0)


class SaleCreate(BaseModel):
    items: list[SaleItemCreate] = Field(default_factory=list)
    perfume_id: Optional[int] = None
    buyer_name: str
    buyer_phone: str
    quantity: int = Field(default=1, gt=0)
    address: AddressCreate
    preferred_delivery_location_id: Optional[int] = None

    @model_validator(mode="after")
    def support_single_item_orders(self):
        if not self.items:
            if self.perfume_id is None:
                raise ValueError("Agrega al menos un perfume al pedido")
            self.items = [SaleItemCreate(perfume_id=self.perfume_id, quantity=self.quantity)]
        return self

class SaleItemOut(BaseModel):
    id: int
    perfume_id: int
    quantity: int
    unit_price: float
    perfume: PerfumeSummary

    class Config:
        from_attributes = True


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
    items: list[SaleItemOut] = Field(default_factory=list)
    delivery_type: str
    preferred_delivery_location: Optional[DeliveryLocationOut] = None
    delivery_location: Optional[DeliveryLocationOut] = None
    delivery_scheduled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
