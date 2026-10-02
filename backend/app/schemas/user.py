from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.schemas.sale import AddressOut


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    address: AddressOut | None = None

    class Config:
        from_attributes = True
