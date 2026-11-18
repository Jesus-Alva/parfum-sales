from pydantic_settings import BaseSettings
from typing import List


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
        """Convierte la cadena separada por comas en una lista limpia."""
        origins = [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]
        lan_ip = self.APP_LAN_IP.strip()
        if lan_ip:
            lan_origin = f"http://{lan_ip}:3005"
            if lan_origin not in origins:
                origins.append(lan_origin)
        return origins


settings = Settings()
