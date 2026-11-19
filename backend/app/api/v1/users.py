from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, field_validator

from app.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.schemas.user import UserOut, UserProfileUpdate, UserPasswordChange
from app.schemas.sale import AddressCreate
from app.models.address import Address
from app.core.security import hash_password, verify_password

router = APIRouter()


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current


@router.patch("/me", response_model=UserOut)
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    changes = payload.model_dump(exclude_unset=True)
    address_was_submitted = "address" in changes
    address_data = changes.pop("address", None)
    for key, value in changes.items():
        setattr(current, key, value)
    if address_was_submitted:
        if address_data is None:
            # Keep past orders' address rows intact while removing it from the profile.
            current.address_id = None
        elif current.address:
            for key, value in address_data.items():
                setattr(current.address, key, value)
        else:
            address = Address(**address_data)
            db.add(address)
            db.flush()
            current.address_id = address.id
    db.commit()
    db.refresh(current)
    return current


@router.put("/me/password", status_code=204)
def change_my_password(
    payload: UserPasswordChange,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current.hashed_password):
        raise HTTPException(400, "La contraseña actual no es correcta")
    current.hashed_password = hash_password(payload.new_password)
    db.commit()


@router.put("/me/address", response_model=UserOut)
def save_my_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.address:
        for key, value in payload.model_dump().items():
            setattr(current.address, key, value)
    else:
        address = Address(**payload.model_dump())
        db.add(address)
        db.flush()
        current.address_id = address.id
    db.commit()
    db.refresh(current)
    return current


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(User).all()

class UserUpdate(BaseModel):
    full_name: str | None = None


class UserRoleUpdate(BaseModel):
    is_admin: bool


class UserPasswordUpdate(BaseModel):
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def password_must_fit_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes")
        return value


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
    if not current.is_admin and payload.model_dump(exclude_unset=True).keys() - {"full_name"}:
        raise HTTPException(403, "No autorizado para modificar estos campos")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(u, k, v)
    db.commit()
    db.refresh(u)
    return u


@router.patch("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")
    if user.id == current.id and not payload.is_admin:
        raise HTTPException(400, "No puedes quitarte el rol de administrador")
    if user.is_admin and not payload.is_admin:
        active_admins = db.query(User).filter(User.is_admin.is_(True), User.is_active.is_(True)).count()
        if user.is_active and active_admins <= 1:
            raise HTTPException(400, "Debe permanecer al menos un administrador activo")
    user.is_admin = payload.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}/password", status_code=204)
def update_user_password(
    user_id: int,
    payload: UserPasswordUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")
    user.hashed_password = hash_password(payload.password)
    db.commit()


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
