from pydantic import BaseModel
from datetime import datetime


class AddressCreate(BaseModel):
    street: str
    number: str = ""
    city: str
    state: str = ""
    postal_code: str = ""
    country: str = "México"
    references: str = ""


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

    class Config:
        from_attributes = True