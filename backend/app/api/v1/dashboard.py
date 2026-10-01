from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_admin
from app.models.sale import Sale
from app.models.perfume import Perfume
from app.models.user import User

router = APIRouter()


@router.get("/stats")
def stats(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    total_sales = db.query(func.count(Sale.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Sale.total), 0)).scalar() or 0
    total_perfumes = db.query(func.count(Perfume.id)).scalar() or 0
    low_stock = db.query(func.count(Perfume.id)).filter(Perfume.stock <= 3).scalar() or 0

    # Ventas por día (últimos 14 días)
    sales_by_day = (
        db.query(
            func.date(Sale.created_at).label("day"),
            func.sum(Sale.total).label("total"),
            func.count(Sale.id).label("count"),
        )
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at))
        .all()
    )

    return {
        "total_sales": total_sales,
        "total_revenue": float(total_revenue),
        "total_perfumes": total_perfumes,
        "low_stock": low_stock,
        "sales_by_day": [
            {"day": str(r.day), "total": float(r.total), "count": r.count}
            for r in sales_by_day
        ],
    }


@router.get("/costs")
def costs(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    """Costo vs precio vs ganancia por perfume."""
    perfumes = db.query(Perfume).all()
    return [
        {
            "name": p.name,
            "brand": p.brand,
            "cost": p.cost,
            "price": p.price,
            "profit": p.price - p.cost,
        }
        for p in perfumes
    ]