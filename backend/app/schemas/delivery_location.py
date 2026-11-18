from datetime import datetime, time
from typing import Literal

from pydantic import BaseModel, Field, model_validator

DeliveryDay = Literal["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


class DeliveryLocationBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=150)
    state: str = ""
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    notes: str = ""
    delivery_day: DeliveryDay | None = None
    delivery_start_time: time | None = None
    delivery_end_time: time | None = None
    is_active: bool = True

    @model_validator(mode="after")
    def validate_delivery_window(self):
        if (self.delivery_start_time is None) != (self.delivery_end_time is None):
            raise ValueError("Indica la hora de inicio y fin del rango de entrega")
        if self.delivery_start_time and self.delivery_end_time and self.delivery_end_time <= self.delivery_start_time:
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio")
        return self


class DeliveryLocationCreate(DeliveryLocationBase):
    delivery_day: DeliveryDay
    delivery_start_time: time
    delivery_end_time: time


class DeliveryLocationUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    notes: str | None = None
    delivery_day: DeliveryDay | None = None
    delivery_start_time: time | None = None
    delivery_end_time: time | None = None
    is_active: bool | None = None

    @model_validator(mode="after")
    def validate_delivery_window(self):
        provided = self.model_fields_set
        if bool({"delivery_start_time", "delivery_end_time"} & provided) and not {"delivery_start_time", "delivery_end_time"}.issubset(provided):
            raise ValueError("Actualiza juntas la hora de inicio y fin del rango")
        if self.delivery_start_time and self.delivery_end_time and self.delivery_end_time <= self.delivery_start_time:
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio")
        return self


class DeliveryLocationOut(DeliveryLocationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
