from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class PerfumeImageOut(BaseModel):
    id: int
    url: str
    position: int

    class Config:
        from_attributes = True

class PerfumeBase(BaseModel):
    name: str
    brand: str = ""
    brand_id: Optional[int] = None
    description: Optional[str] = ""
    gender: Optional[str] = "unisex"
    family: Optional[str] = ""
    notes: Optional[str] = ""
    volume_ml: Optional[int] = 100
    price: float = Field(ge=0)
    discount_percent: float = Field(default=0, ge=0, le=100)
    cost: float = 0
    stock: int = 0
    image_url: Optional[str] = ""
    tipo: Optional[str] = ""
    perfil: Optional[str] = ""
    estilo: Optional[str] = ""
    uso: Optional[str] = ""
    presentacion: Optional[str] = ""


class PerfumeCreate(PerfumeBase):
    images: Optional[List[str]] = []


class PerfumeUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    brand_id: Optional[int] = None
    description: Optional[str] = None
    gender: Optional[str] = None
    family: Optional[str] = None
    notes: Optional[str] = None
    volume_ml: Optional[int] = None
    price: Optional[float] = None
    discount_percent: Optional[float] = Field(default=None, ge=0, le=100)
    cost: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    tipo: Optional[str] = None
    perfil: Optional[str] = None
    estilo: Optional[str] = None
    uso: Optional[str] = None
    presentacion: Optional[str] = None

class PerfumeOut(PerfumeBase):
    id: int
    created_at: datetime
    images: List[PerfumeImageOut] = [] 
    discounted_price: float
    brand_logo_url: str = ""

    class Config:
        from_attributes = True
