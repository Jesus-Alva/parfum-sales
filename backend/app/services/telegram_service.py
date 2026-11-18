import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)


def send_telegram_message(text: str) -> bool:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        logger.warning("Telegram no está configurado; se omite la notificación")
        return False

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
    }
    try:
        with httpx.Client(timeout=10) as client:
            r = client.post(url, json=payload)
            r.raise_for_status()
            return True
    except Exception as exc:
        # Do not log the exception itself: HTTP client errors may include the
        # bot token in the Telegram API URL.
        logger.error("Falló el envío a Telegram (%s)", type(exc).__name__)
        return False
