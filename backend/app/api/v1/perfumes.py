from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.perfume import Perfume
from app.models.user import User
from app.schemas.perfume import PerfumeCreate, PerfumeUpdate, PerfumeOut

router = APIRouter()


@router.get("/", response_model=list[PerfumeOut])
def list_perfumes(db: Session = Depends(get_db)):
    return db.query(Perfume).order_by(Perfume.created_at.desc()).all()


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
    _: User = Depends(get_current_user),
):
    perfume = Perfume(**payload.model_dump())
    db.add(perfume)
    db.commit()
    db.refresh(perfume)
    return perfume


@router.put("/{perfume_id}", response_model=PerfumeOut)
def update_perfume(
    perfume_id: int,
    payload: PerfumeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    p = db.query(Perfume).filter(Perfume.id == perfume_id).first()
    if not p:
        raise HTTPException(404, "Perfume no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
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