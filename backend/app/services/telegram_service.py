import httpx
from app.config import settings


def send_telegram_message(text: str) -> bool:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        print("[Telegram] Credenciales no configuradas; se omite notificación.")
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
    except Exception as e:
        print(f"[Telegram] Error enviando mensaje: {e}")
        return False