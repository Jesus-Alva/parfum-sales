from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime


from app.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.sale import Sale
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleOut
from app.services.sale_service import create_sale
from app.tasks.notifications import notify_new_sale, notify_delivery_confirmed
from app.models.delivery_location import DeliveryLocation

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
        "delivery_type": sale.delivery_type,
        "preferred_location": sale.preferred_delivery_location.name if sale.preferred_delivery_location else "Por paquetería",
    })
    return sale


@router.get("/", response_model=list[SaleOut])
def list_sales(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(Sale).filter(Sale.status == "delivered").order_by(Sale.created_at.desc()).all()


@router.get("/orders", response_model=list[SaleOut])
def list_orders(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(Sale).filter(Sale.status != "delivered").order_by(Sale.created_at.desc()).all()


@router.get("/orders/folio/{folio}", response_model=SaleOut)
def find_order(folio: str, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    sale = db.query(Sale).filter(Sale.folio == folio.strip()).first()
    if not sale or sale.status == "delivered":
        raise HTTPException(404, "Pedido pendiente no encontrado")
    return sale


class DeliveryConfirmation(BaseModel):
    delivery_location_id: int | None = None
    delivery_scheduled_at: datetime | None = None


@router.patch("/{sale_id}/delivery", response_model=SaleOut)
def confirm_delivery(sale_id: int, payload: DeliveryConfirmation, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale or sale.status == "delivered":
        raise HTTPException(404, "Pedido pendiente no encontrado")
    if sale.delivery_type == "local":
        location_id = payload.delivery_location_id or sale.preferred_delivery_location_id
        location = db.query(DeliveryLocation).filter(DeliveryLocation.id == location_id, DeliveryLocation.is_active.is_(True)).first()
        if not location:
            raise HTTPException(400, "Selecciona una ubicación activa para la entrega")
        if not payload.delivery_scheduled_at:
            raise HTTPException(400, "Indica la fecha y hora acordadas")
        sale.delivery_location_id = location.id
        sale.delivery_scheduled_at = payload.delivery_scheduled_at
        sale.status = "ready_for_delivery"
    else:
        sale.status = "ready_for_delivery"
    db.commit()
    db.refresh(sale)
    if sale.delivery_type == "local":
        notify_delivery_confirmed.delay({
            "folio": sale.folio,
            "buyer_name": sale.buyer_name,
            "buyer_phone": sale.buyer_phone,
            "location": sale.delivery_location.name,
            "address": sale.delivery_location.address,
            "scheduled_at": sale.delivery_scheduled_at.isoformat(),
        })
    return sale


@router.post("/{sale_id}/complete", response_model=SaleOut)
def complete_delivery(sale_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale or sale.status == "delivered":
        raise HTTPException(404, "Pedido pendiente no encontrado")
    if sale.delivery_type == "local" and sale.status != "ready_for_delivery":
        raise HTTPException(400, "Confirma primero la ubicación y el horario de entrega")
    sale.status = "delivered"
    db.commit()
    db.refresh(sale)
    return sale


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
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
    _: User = Depends(get_current_admin),
):
    s = db.query(Sale).filter(Sale.id == sale_id).first()
    if not s:
        raise HTTPException(404, "Venta no encontrada")
    if s.status == "delivered":
        raise HTTPException(400, "Una venta finalizada no puede volver a pedido")
    if payload.status == "delivered":
        if s.delivery_type == "local" and s.status != "ready_for_delivery":
            raise HTTPException(400, "Confirma primero la ubicación y el horario de entrega")
    elif payload.status != "pending_delivery":
        raise HTTPException(400, "Estado no válido; usa la confirmación de entrega del panel de pedidos")
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
