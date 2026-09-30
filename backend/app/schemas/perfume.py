from pydantic import BaseModel
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
    brand: str
    description: Optional[str] = ""
    gender: Optional[str] = "unisex"
    family: Optional[str] = ""
    notes: Optional[str] = ""
    volume_ml: Optional[int] = 100
    price: float
    cost: float = 0
    stock: int = 0
    image_url: Optional[str] = ""
    


class PerfumeCreate(PerfumeBase):
    images: Optional[List[str]] = []


class PerfumeUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    gender: Optional[str] = None
    family: Optional[str] = None
    notes: Optional[str] = None
    volume_ml: Optional[int] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None 


class PerfumeOut(PerfumeBase):
    id: int
    created_at: datetime
    images: List[PerfumeImageOut] = [] 

    class Config:
        from_attributes = True