from pydantic import BaseModel, Field


class BrandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    logo_url: str = Field(default="", max_length=500)


class BrandUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    logo_url: str | None = Field(default=None, max_length=500)


class BrandOut(BaseModel):
    id: int
    name: str
    logo_url: str

    class Config:
        from_attributes = True
