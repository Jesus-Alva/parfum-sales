from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.config import settings
from app.database import get_db
from app.models.delivery_location import DeliveryLocation
from app.models.user import User
from app.schemas.delivery_location import (
    DeliveryLocationCreate,
    DeliveryLocationOut,
    DeliveryLocationUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[DeliveryLocationOut])
def public_locations(db: Session = Depends(get_db)):
    return db.query(DeliveryLocation).filter(DeliveryLocation.is_active.is_(True)).order_by(DeliveryLocation.name).all()


@router.get("/admin", response_model=list[DeliveryLocationOut])
def all_locations(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(DeliveryLocation).order_by(DeliveryLocation.name).all()


@router.get("/settings")
def delivery_settings():
    return {"business_city": settings.BUSINESS_CITY, "business_state": settings.BUSINESS_STATE}


@router.post("/", response_model=DeliveryLocationOut, status_code=201)
def create_location(payload: DeliveryLocationCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    location = DeliveryLocation(**payload.model_dump())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.patch("/{location_id}", response_model=DeliveryLocationOut)
def update_location(location_id: int, payload: DeliveryLocationUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    location = db.query(DeliveryLocation).filter(DeliveryLocation.id == location_id).first()
    if not location:
        raise HTTPException(404, "Ubicación no encontrada")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(location, key, value)
    db.commit()
    db.refresh(location)
    return location


@router.delete("/{location_id}", status_code=204)
def deactivate_location(location_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    location = db.query(DeliveryLocation).filter(DeliveryLocation.id == location_id).first()
    if not location:
        raise HTTPException(404, "Ubicación no encontrada")
    location.is_active = False
    db.commit()
