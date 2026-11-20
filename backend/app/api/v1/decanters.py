from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.perfume import Perfume
from app.models.user import User
from app.schemas.decanter import BasePerfumeOption, DecanterCreate, DecanterOut, DecanterUpdate

router = APIRouter()


def _parent_or_404(db: Session, perfume_id: int) -> Perfume:
    perfume = db.query(Perfume).filter(
        Perfume.id == perfume_id,
        Perfume.parent_perfume_id.is_(None),
        Perfume.classification == "regular",
    ).first()
    if not perfume:
        raise HTTPException(404, "Perfume base no encontrado")
    return perfume


def _inherit_characteristics(decanter: Perfume, perfume: Perfume) -> None:
    decanter.parent_perfume = perfume
    decanter.name = f"{perfume.name} · Decanter {decanter.volume_ml} ml"
    decanter.brand = perfume.brand
    decanter.brand_id = perfume.brand_id
    decanter.description = perfume.description
    decanter.gender = perfume.gender
    decanter.family = perfume.family
    decanter.notes = perfume.notes
    decanter.classification = "decanter"
    decanter.discount_percent = 0
    decanter.cost = round((float(perfume.cost or 0) / max(int(perfume.volume_ml or 1), 1)) * decanter.volume_ml, 2)
    decanter.tipo = perfume.tipo
    decanter.perfil = perfume.perfil
    decanter.estilo = perfume.estilo
    decanter.uso = perfume.uso
    decanter.presentacion = f"Decanter de {decanter.volume_ml} ml"


def _out(decanter: Perfume) -> dict:
    return {
        "id": decanter.id,
        "perfume_id": decanter.parent_perfume_id,
        "perfume_name": decanter.parent_perfume.name if decanter.parent_perfume else decanter.name,
        "brand": decanter.brand,
        "volume_ml": decanter.volume_ml,
        "price": decanter.price,
        "discounted_price": decanter.discounted_price,
        "stock": decanter.stock,
        "is_enabled": decanter.is_enabled,
        "image_url": decanter.image_url,
        "perfume_image_url": decanter.parent_perfume.image_url if decanter.parent_perfume else "",
        "created_at": decanter.created_at,
    }


@router.get("/", response_model=list[DecanterOut])
def list_decanters(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    records = db.query(Perfume).filter(Perfume.parent_perfume_id.is_not(None)).order_by(Perfume.created_at.desc()).all()
    return [_out(record) for record in records]


@router.get("/perfumes", response_model=list[BasePerfumeOption])
def list_base_perfumes(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    records = db.query(Perfume).filter(
        Perfume.parent_perfume_id.is_(None),
        Perfume.classification == "regular",
    ).order_by(Perfume.name.asc()).all()
    return [
        {
            "id": item.id,
            "name": item.name,
            "brand": item.brand,
            "image_url": item.image_url,
            "volume_ml": item.volume_ml,
            "family": item.family,
            "gender": item.gender,
            "description": item.description,
            "notes": item.notes,
            "tipo": item.tipo,
            "perfil": item.perfil,
            "estilo": item.estilo,
            "uso": item.uso,
            "presentacion": item.presentacion,
        }
        for item in records
    ]


@router.post("/", response_model=DecanterOut, status_code=201)
def create_decanter(
    payload: DecanterCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    perfume = _parent_or_404(db, payload.perfume_id)
    existing = db.query(Perfume).filter(
        Perfume.parent_perfume_id == perfume.id,
        Perfume.volume_ml == payload.volume_ml,
    ).first()
    if existing:
        raise HTTPException(409, "Ya existe un decanter de ese tamaño para este perfume")

    decanter = Perfume(
        parent_perfume=perfume,
        name="",
        brand=perfume.brand,
        volume_ml=payload.volume_ml,
        price=payload.price,
        cost=0,
        stock=payload.stock,
        image_url=payload.image_url,
        classification="decanter",
    )
    _inherit_characteristics(decanter, perfume)
    db.add(decanter)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Ya existe un decanter de ese tamaño para este perfume")
    db.refresh(decanter)
    return _out(decanter)


@router.get("/{decanter_id}", response_model=DecanterOut)
def get_decanter(
    decanter_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    decanter = db.query(Perfume).filter(Perfume.id == decanter_id, Perfume.parent_perfume_id.is_not(None)).first()
    if not decanter:
        raise HTTPException(404, "Decanter no encontrado")
    return _out(decanter)


@router.put("/{decanter_id}", response_model=DecanterOut)
def update_decanter(
    decanter_id: int,
    payload: DecanterUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    decanter = db.query(Perfume).filter(Perfume.id == decanter_id, Perfume.parent_perfume_id.is_not(None)).first()
    if not decanter:
        raise HTTPException(404, "Decanter no encontrado")
    data = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    parent = _parent_or_404(db, data.pop("perfume_id", decanter.parent_perfume_id))
    volume = data.get("volume_ml", decanter.volume_ml)
    duplicate = db.query(Perfume).filter(
        Perfume.parent_perfume_id == parent.id,
        Perfume.volume_ml == volume,
        Perfume.id != decanter.id,
    ).first()
    if duplicate:
        raise HTTPException(409, "Ya existe un decanter de ese tamaño para este perfume")
    for key in ("volume_ml", "price", "stock", "image_url"):
        if key in data:
            setattr(decanter, key, data[key])
    _inherit_characteristics(decanter, parent)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Ya existe un decanter de ese tamaño para este perfume")
    db.refresh(decanter)
    return _out(decanter)


@router.patch("/{decanter_id}/status", response_model=DecanterOut)
def toggle_decanter(
    decanter_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    decanter = db.query(Perfume).filter(Perfume.id == decanter_id, Perfume.parent_perfume_id.is_not(None)).first()
    if not decanter:
        raise HTTPException(404, "Decanter no encontrado")
    decanter.is_enabled = not decanter.is_enabled
    db.commit()
    db.refresh(decanter)
    return _out(decanter)
