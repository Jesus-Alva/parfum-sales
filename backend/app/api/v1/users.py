from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(User).all()

class UserUpdate(BaseModel):
    full_name: str | None = None
    is_active: bool | None = None
    is_admin: bool | None = None


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.id != user_id and not current.is_admin:
        raise HTTPException(403, "No autorizado")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "Usuario no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(u, k, v)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "Usuario no encontrado")
    db.delete(u)
    db.commit()