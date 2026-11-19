import logging
import re

import httpx

from app.config import settings

logger = logging.getLogger(__name__)
logging.getLogger("httpx").setLevel(logging.WARNING)


def _normalize_recipient(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    # Mexican WhatsApp numbers use country code 52 followed by the 10-digit number.
    if len(digits) == 10:
        return f"52{digits}"
    if digits.startswith("521") and len(digits) == 13:
        return f"52{digits[-10:]}"
    return digits


def send_new_order_whatsapp(sale_data: dict) -> bool:
    access_token = settings.WHATSAPP_ACCESS_TOKEN.strip()
    phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID.strip()
    recipient = _normalize_recipient(settings.WHATSAPP_TO_NUMBER)
    if not access_token or not phone_number_id or not recipient:
        logger.warning("WhatsApp Cloud API no está configurada; se omite la notificación del pedido %s", sale_data.get("folio"))
        return False

    items = sale_data.get("items") or [{
        "name": sale_data.get("perfume_name", "Perfume"),
        "quantity": sale_data.get("quantity", 1),
    }]
    products_text = ", ".join(f"{item['name']} × {item['quantity']}" for item in items)
    if len(products_text) > 700:
        products_text = products_text[:697].rstrip() + "…"

    delivery_type = "Entrega local" if sale_data.get("delivery_type") == "local" else "Paquetería"
    parameters = [
        sale_data.get("folio", ""),
        products_text,
        f"{float(sale_data.get('total', 0)):.2f}",
        sale_data.get("buyer_name", ""),
        sale_data.get("buyer_phone", ""),
        sale_data.get("address", ""),
        delivery_type,
        sale_data.get("preferred_location", "Por paquetería"),
    ]
    payload = {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": settings.WHATSAPP_ORDER_TEMPLATE,
            "language": {"code": settings.WHATSAPP_TEMPLATE_LANGUAGE},
            "components": [{
                "type": "body",
                "parameters": [{"type": "text", "text": str(value)} for value in parameters],
            }],
        },
    }
    url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{phone_number_id}/messages"
    try:
        with httpx.Client(timeout=15) as client:
            response = client.post(
                url,
                headers={"Authorization": f"Bearer {access_token}"},
                json=payload,
            )
            response.raise_for_status()
        return True
    except Exception as exc:
        # Keep access tokens, recipient numbers, and message contents out of logs.
        logger.error(
            "Falló el envío de WhatsApp para el pedido %s (tipo de error: %s)",
            sale_data.get("folio"),
            type(exc).__name__,
        )
        return False
