from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_optional_user
from app.database import get_db
from app.models.perfume import Perfume
from app.models.perfume_review import PerfumeReview
from app.models.user import User
from app.schemas.perfume_review import (
    PerfumeReviewCreate,
    PerfumeReviewOut,
    PerfumeReviewsOut,
    RandomPerfumeReviewOut,
)

router = APIRouter()


@router.get("/reviews/random", response_model=list[RandomPerfumeReviewOut])
def list_random_reviews(
    limit: int = Query(default=3, ge=1, le=12),
    db: Session = Depends(get_db),
):
    reviews = (
        db.query(PerfumeReview)
        .join(PerfumeReview.perfume)
        .options(joinedload(PerfumeReview.user), joinedload(PerfumeReview.perfume))
        .filter(Perfume.is_enabled.is_(True))
        .order_by(func.random())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": review.id,
            "perfume_id": review.perfume_id,
            "perfume_name": review.perfume.name,
            "brand": review.perfume.brand,
            "author_name": review.author_name,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
        }
        for review in reviews
    ]


@router.get("/perfumes/{perfume_id}/reviews", response_model=PerfumeReviewsOut)
def list_perfume_reviews(
    perfume_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current: User | None = Depends(get_optional_user),
):
    if not db.query(Perfume.id).filter(Perfume.id == perfume_id).first():
        raise HTTPException(404, "Perfume no encontrado")

    total, average = db.query(func.count(PerfumeReview.id), func.avg(PerfumeReview.rating)).filter(
        PerfumeReview.perfume_id == perfume_id
    ).one()

    reviews = (
        db.query(PerfumeReview)
        .options(joinedload(PerfumeReview.user))
        .filter(PerfumeReview.perfume_id == perfume_id)
        .order_by(PerfumeReview.created_at.desc(), PerfumeReview.id.desc())
        .limit(limit)
        .all()
    )
    my_review = None
    if current:
        my_review = (
            db.query(PerfumeReview)
            .options(joinedload(PerfumeReview.user))
            .filter(PerfumeReview.perfume_id == perfume_id, PerfumeReview.user_id == current.id)
            .first()
        )

    return PerfumeReviewsOut(
        reviews=reviews,
        average_rating=round(float(average or 0), 1),
        total_reviews=total,
        my_review=my_review,
    )


@router.put(
    "/perfumes/{perfume_id}/reviews/me",
    response_model=PerfumeReviewOut,
)
def upsert_my_perfume_review(
    perfume_id: int,
    payload: PerfumeReviewCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if not db.query(Perfume.id).filter(Perfume.id == perfume_id).first():
        raise HTTPException(404, "Perfume no encontrado")

    review = (
        db.query(PerfumeReview)
        .filter(PerfumeReview.perfume_id == perfume_id, PerfumeReview.user_id == current.id)
        .first()
    )
    if review:
        review.rating = payload.rating
        review.comment = payload.comment
        review.updated_at = datetime.now(timezone.utc)
    else:
        review = PerfumeReview(
            perfume_id=perfume_id,
            user_id=current.id,
            rating=payload.rating,
            comment=payload.comment,
        )
        db.add(review)

    db.commit()
    db.refresh(review)
    return review
