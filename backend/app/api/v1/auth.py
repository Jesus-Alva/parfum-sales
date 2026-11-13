import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.schemas.auth import ForgotPasswordRequest, LoginRequest, ResetPasswordRequest, Token
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password, verify_password, create_access_token
from app.services.email_service import is_smtp_configured, send_password_reset_email
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)
RESET_TOKEN_TTL = timedelta(minutes=30)
RESET_EMAIL_COOLDOWN = timedelta(minutes=1)


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    token = create_access_token(subject=user.email)
    return Token(
        access_token=token,
        is_admin=user.is_admin,
        full_name=user.full_name,
        email=user.email
    )


@router.post("/password/forgot")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Sends a reset link without revealing whether the email is registered."""
    if not is_smtp_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La recuperación por correo aún no está configurada.",
        )

    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.is_active:
        return {"message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."}

    now = datetime.now(timezone.utc)
    recent_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at >= now - RESET_EMAIL_COOLDOWN,
        )
        .first()
    )
    if recent_token:
        return {"message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."}

    raw_token = secrets.token_urlsafe(32)
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at.is_(None),
    ).update({PasswordResetToken.used_at: now}, synchronize_session=False)
    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=_hash_reset_token(raw_token),
        expires_at=now + RESET_TOKEN_TTL,
    )
    db.add(reset_token)
    db.commit()

    reset_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/restablecer-contrasena?token={raw_token}"
    try:
        send_password_reset_email(user.email, user.full_name, reset_url)
    except Exception:
        # Keep the public response identical to avoid disclosing account existence.
        logger.exception("Could not send password reset email")

    return {"message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."}


@router.post("/password/reset")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == _hash_reset_token(payload.token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .with_for_update()
        .first()
    )
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace no es válido o ya expiró. Solicita uno nuevo.",
        )

    user = db.query(User).filter(User.id == reset_token.user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace no es válido o ya expiró. Solicita uno nuevo.",
        )

    user.hashed_password = hash_password(payload.new_password)
    reset_token.used_at = now
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.id != reset_token.id,
        PasswordResetToken.used_at.is_(None),
    ).update({PasswordResetToken.used_at: now}, synchronize_session=False)
    db.commit()
    return {"message": "Tu contraseña se actualizó. Ya puedes iniciar sesión."}
