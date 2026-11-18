from pydantic_settings import BaseSettings
from typing import List
from urllib.parse import urlsplit


class Settings(BaseSettings):
    PROJECT_NAME: str = "Scentia"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/1"

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    BUSINESS_CITY: str = ""
    BUSINESS_STATE: str = ""

    BACKEND_CORS_ORIGINS: str = "http://localhost:3005"
    APP_LAN_IP: str = ""

    FRONTEND_BASE_URL: str = "http://localhost:3005"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Scentia"
    SMTP_USE_TLS: bool = True

# ── Uploads ────────────────────────────
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp,image/gif, image/avif"

    @property
    def allowed_image_types(self) -> list[str]:
        return [t.strip() for t in self.ALLOWED_IMAGE_TYPES.split(",") 
                if t.strip()]
    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins(self) -> List[str]:
        """Build a normalized allowlist for the frontend's development origins."""
        configured = [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]
        configured.append(self.FRONTEND_BASE_URL.strip())

        # Browsers send origins without a trailing slash or path. Normalize
        # values copied from .env so a harmless trailing slash cannot break CORS.
        origins = []
        for value in configured:
            parsed = urlsplit(value)
            origin = f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme and parsed.netloc else value.rstrip("/")
            if origin and origin not in origins:
                origins.append(origin)

        # This hostname is used to access the app through the local reverse proxy.
        for origin in ("http://localhost.local", "http://localhost.local:3005"):
            if origin not in origins:
                origins.append(origin)

        lan_ip = self.APP_LAN_IP.strip()
        if lan_ip:
            for lan_origin in (f"http://{lan_ip}", f"http://{lan_ip}:3005"):
                if lan_origin not in origins:
                    origins.append(lan_origin)
        return origins


settings = Settings()
