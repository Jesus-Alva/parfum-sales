from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class PerfumeReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)

    @field_validator("comment")
    @classmethod
    def comment_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El comentario no puede estar vacío")
        return value


class PerfumeReviewOut(BaseModel):
    id: int
    perfume_id: int
    user_id: int
    author_name: str
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PerfumeReviewsOut(BaseModel):
    reviews: list[PerfumeReviewOut]
    average_rating: float
    total_reviews: int
    my_review: PerfumeReviewOut | None = None


class RandomPerfumeReviewOut(BaseModel):
    id: int
    perfume_id: int
    perfume_name: str
    brand: str
    author_name: str
    rating: int
    comment: str
    created_at: datetime
