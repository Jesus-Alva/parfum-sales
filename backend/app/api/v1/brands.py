from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.brand import Brand
from app.models.perfume import Perfume
from app.models.user import User
from app.schemas.brand import BrandCreate, BrandOut, BrandUpdate

router = APIRouter()


@router.get("/", response_model=list[BrandOut])
def list_brands(db: Session = Depends(get_db)):
    return db.query(Brand).order_by(func.lower(Brand.name)).all()


@router.post("/", response_model=BrandOut, status_code=201)
def create_brand(
    payload: BrandCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(422, "El nombre de la marca es obligatorio")
    exists = db.query(Brand).filter(func.lower(Brand.name) == name.lower()).first()
    if exists:
        raise HTTPException(409, "Ya existe una marca con ese nombre")
    brand = Brand(name=name, logo_url=payload.logo_url.strip())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.put("/{brand_id}", response_model=BrandOut)
def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(404, "Marca no encontrada")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        data["name"] = data["name"].strip()
        if not data["name"]:
            raise HTTPException(422, "El nombre de la marca es obligatorio")
        duplicate = db.query(Brand).filter(
            func.lower(Brand.name) == data["name"].lower(), Brand.id != brand_id
        ).first()
        if duplicate:
            raise HTTPException(409, "Ya existe una marca con ese nombre")
        db.query(Perfume).filter(Perfume.brand_id == brand_id).update(
            {Perfume.brand: data["name"]}, synchronize_session=False
        )
    if "logo_url" in data and data["logo_url"] is not None:
        data["logo_url"] = data["logo_url"].strip()
    for key, value in data.items():
        setattr(brand, key, value)
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/{brand_id}", status_code=204)
def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(404, "Marca no encontrada")
    if db.query(Perfume.id).filter(Perfume.brand_id == brand_id).first():
        raise HTTPException(409, "No puedes eliminar una marca que está asignada a perfumes")
    db.delete(brand)
    db.commit()
