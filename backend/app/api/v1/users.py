from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(User).all()