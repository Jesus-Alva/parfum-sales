from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from app.schemas.sale import AddressCreate, AddressOut


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None


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


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    address: AddressCreate | None = None

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("El nombre no puede estar vacío")
        return normalized

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=72)

    @field_validator("new_password")
    @classmethod
    def password_must_fit_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes")
        return value
