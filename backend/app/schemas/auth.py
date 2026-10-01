from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_admin: bool = False
    full_name: str = ""
    email: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str