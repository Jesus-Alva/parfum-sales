from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel


from app.database import get_db
from app.api.deps import get_current_user
from app.models.sale import Sale
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleOut
from app.services.sale_service import create_sale
from app.tasks.notifications import notify_new_sale

router = APIRouter()


@router.post("/", response_model=SaleOut, status_code=201)
def register_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    try:
        sale = create_sale(db, payload)
    except ValueError as e:
        raise HTTPException(400, str(e))

    # Enviar notificación de Telegram de forma asíncrona
    notify_new_sale.delay({
        "folio": sale.folio,
        "perfume_name": sale.perfume.name,
        "quantity": sale.quantity,
        "total": sale.total,
        "buyer_name": sale.buyer_name,
        "buyer_phone": sale.buyer_phone,
        "address": f"{sale.address.street} {sale.address.number}, {sale.address.city}",
    })
    return sale


@router.get("/", response_model=list[SaleOut])
def list_sales(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Sale).order_by(Sale.created_at.desc()).all()


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    s = db.query(Sale).filter(Sale.id == sale_id).first()
    if not s:
        raise HTTPException(404, "Venta no encontrada")
    return s


class SaleUpdateStatus(BaseModel):
    status: str  # pending, registered, shipped, delivered, cancelled


@router.patch("/{sale_id}/status", response_model=SaleOut)
def update_sale_status(
    sale_id: int,
    payload: SaleUpdateStatus,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    s = db.query(Sale).filter(Sale.id == sale_id).first()
    if not s:
        raise HTTPException(404, "Venta no encontrada")
    s.status = payload.status
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{sale_id}", status_code=204)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    s = db.query(Sale).filter(Sale.id == sale_id).first()
    if not s:
        raise HTTPException(404, "Venta no encontrada")
    db.delete(s)
    db.commit()