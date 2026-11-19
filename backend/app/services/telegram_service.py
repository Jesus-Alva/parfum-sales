import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)
# Telegram embeds the bot token in the request path; keep httpx's request log
# below INFO so credentials are not written to container logs.
logging.getLogger("httpx").setLevel(logging.WARNING)


def send_telegram_message(text: str) -> bool:
    token = settings.TELEGRAM_BOT_TOKEN.strip()
    chat_id = settings.TELEGRAM_CHAT_ID.strip()
    placeholder_tokens = {"123456:abc-def_your_token_here", "your_bot_token"}
    placeholder_chat_ids = {"123456789", "your_chat_id"}
    if not token or not chat_id or token.lower() in placeholder_tokens or chat_id.lower() in placeholder_chat_ids:
        logger.warning("Telegram no está configurado; se omite la notificación")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
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
