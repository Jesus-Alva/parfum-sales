from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

from app.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.perfume import Perfume
from app.models.perfume_image import PerfumeImage
from app.models.user import User
from app.schemas.perfume import PerfumeCreate, PerfumeUpdate, PerfumeOut

router = APIRouter()


def _sync_images(db: Session, perfume: Perfume, urls: list[str]):
    """Reemplaza las imágenes del perfume (excepto el cover)."""
    # Eliminar todas las imágenes existentes
    db.query(PerfumeImage).filter(PerfumeImage.perfume_id == perfume.id).delete()

    # Crear las nuevas
    for i, url in enumerate(urls):
        db.add(PerfumeImage(perfume_id=perfume.id, url=url, position=i))

    # El cover (image_url del perfume) es la primera si no se especificó
    if urls and not perfume.image_url:
        perfume.image_url = urls[0]


@router.get("/", response_model=list[PerfumeOut])
def list_perfumes(
    search: Optional[str] = Query(None, description="Busca en nombre, marca, notas"),
    gender: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    family: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    in_stock: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query(
        "recent", description="recent|price_asc|price_desc|name"
    ),
    db: Session = Depends(get_db),
):
    q = db.query(Perfume)

    if search:
        term = f"%{search}%"
        q = q.filter(
            or_(
                Perfume.name.ilike(term),
                Perfume.brand.ilike(term),
                Perfume.notes.ilike(term),
                Perfume.perfil.ilike(term),
                Perfume.description.ilike(term),
            )
        )

    if gender:
        q = q.filter(Perfume.gender == gender)

    if brand:
        q = q.filter(Perfume.brand == brand)

    if family:
        q = q.filter(Perfume.family == family)

    if tipo:
        q = q.filter(Perfume.tipo == tipo)

    if min_price is not None:
        q = q.filter(Perfume.price >= min_price)

    if max_price is not None:
        q = q.filter(Perfume.price <= max_price)

    if in_stock:
        q = q.filter(Perfume.stock > 0)

    # Ordenamiento
    if sort_by == "price_asc":
        q = q.order_by(Perfume.price.asc())
    elif sort_by == "price_desc":
        q = q.order_by(Perfume.price.desc())
    elif sort_by == "name":
        q = q.order_by(Perfume.name.asc())
    else:
        q = q.order_by(Perfume.created_at.desc())

    return q.all()


@router.get("/filters/options")
def filter_options(db: Session = Depends(get_db)):
    """Devuelve los valores únicos disponibles para construir los filtros."""
    brands = [r[0] for r in db.query(Perfume.brand).distinct().all() if r[0]]
    families = [r[0] for r in db.query(Perfume.family).distinct().all() if r[0]]
    tipos = [r[0] for r in db.query(Perfume.tipo).distinct().all() if r[0]]

    price_range = db.query(func.min(Perfume.price), func.max(Perfume.price)).first()

    return {
        "brands": sorted(brands),
        "families": sorted(families),
        "tipos": sorted(tipos),
        "price_min": float(price_range[0] or 0),
        "price_max": float(price_range[1] or 0),
    }


@router.get("/{perfume_id}", response_model=PerfumeOut)
def get_perfume(perfume_id: int, db: Session = Depends(get_db)):
    p = db.query(Perfume).filter(Perfume.id == perfume_id).first()
    if not p:
        raise HTTPException(404, "Perfume no encontrado")
    return p


@router.post("/", response_model=PerfumeOut, status_code=201)
def create_perfume(
    payload: PerfumeCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    data = payload.model_dump(exclude={"images"})
    perfume = Perfume(**data)
    db.add(perfume)
    db.flush()  # para tener el id

    # Guardar imágenes
    for i, url in enumerate(payload.images or []):
        db.add(PerfumeImage(perfume_id=perfume.id, url=url, position=i))

    # Si no hay cover, usar la primera imagen
    if payload.images and not perfume.image_url:
        perfume.image_url = payload.images[0]

    db.commit()
    db.refresh(perfume)
    return perfume


@router.put("/{perfume_id}", response_model=PerfumeOut)
def update_perfume(
    perfume_id: int,
    payload: PerfumeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    p = db.query(Perfume).filter(Perfume.id == perfume_id).first()
    if not p:
        raise HTTPException(404, "Perfume no encontrado")

    data = payload.model_dump(exclude_unset=True, exclude={"images"})
    for k, v in data.items():
        setattr(p, k, v)

    # Si mandaron lista de imágenes, reemplazar
    if payload.images is not None:
        _sync_images(db, p, payload.images)
        if payload.images and not p.image_url:
            p.image_url = payload.images[0]

    db.commit()
    db.refresh(p)
    return p


@router.delete("/{perfume_id}", status_code=204)
def delete_perfume(
    perfume_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    p = db.query(Perfume).filter(Perfume.id == perfume_id).first()
    if not p:
        raise HTTPException(404, "Perfume no encontrado")
    db.delete(p)
    db.commit()


# ── Endpoint para eliminar UNA imagen individual ─────────────────
@router.delete("/{perfume_id}/images/{image_id}", status_code=204)
def delete_image(
    perfume_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    img = (
        db.query(PerfumeImage)
        .filter(PerfumeImage.id == image_id, PerfumeImage.perfume_id == perfume_id)
        .first()
    )
    if not img:
        raise HTTPException(404, "Imagen no encontrada")
    db.delete(img)
    db.commit()
