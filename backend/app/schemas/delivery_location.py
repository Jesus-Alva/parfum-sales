from datetime import datetime

from pydantic import BaseModel, Field


class DeliveryLocationBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=150)
    state: str = ""
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    notes: str = ""
    is_active: bool = True


class DeliveryLocationCreate(DeliveryLocationBase):
    pass


class DeliveryLocationUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    notes: str | None = None
    is_active: bool | None = None


class DeliveryLocationOut(DeliveryLocationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
