import httpx
from app.core.celery_app import celery_app
from app.config import settings

@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def send_telegram_sale_notification(self, sale_data: dict):
    """
    Tarea asíncrona que envía una notificación a Telegram
    cuando se registra una nueva venta.
    """
    message = (
        f"🛒 *NUEVA VENTA REGISTRADA*\n\n"
        f"📋 *Folio:* `{sale_data['folio']}`\n"
        f"🧴 *Perfume:* {sale_data['perfume_name']}\n"
        f"💰 *Precio:* ${sale_data['price']:.2f}\n"
        f"👤 *Comprador:* {sale_data['buyer_name']}\n"
        f"📞 *Teléfono:* {sale_data['phone']}\n"
        f"📍 *Dirección:* {sale_data['address']}\n"
        f"📅 *Fecha:* {sale_data['created_at']}\n"
    )

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
    }

    try:
        with httpx.Client(timeout=10) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise self.retry(exc=exc)

    return {"status": "sent", "sale_folio": sale_data["folio"]}