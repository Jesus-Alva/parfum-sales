from datetime import datetime

from pydantic import BaseModel, Field


class DecanterCreate(BaseModel):
    perfume_id: int
    volume_ml: int = Field(gt=0)
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    image_url: str = ""


class DecanterUpdate(BaseModel):
    perfume_id: int | None = None
    volume_ml: int | None = Field(default=None, gt=0)
    price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    image_url: str | None = None


class DecanterOut(BaseModel):
    id: int
    perfume_id: int
    perfume_name: str
    brand: str
    volume_ml: int
    price: float
    discounted_price: float
    stock: int
    is_enabled: bool
    image_url: str
    perfume_image_url: str
    created_at: datetime


class BasePerfumeOption(BaseModel):
    id: int
    name: str
    brand: str
    image_url: str
    volume_ml: int
    family: str
    gender: str
    description: str
    notes: str
    tipo: str
    perfil: str
    estilo: str
    uso: str
    presentacion: str

