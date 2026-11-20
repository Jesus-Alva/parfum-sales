from datetime import datetime
from zoneinfo import ZoneInfo
from html import escape
import logging
import re
from urllib.parse import quote

from app.core.celery_app import celery_app
from app.services.telegram_service import send_telegram_message
from app.services.whatsapp_service import send_new_order_whatsapp

logger = logging.getLogger(__name__)
DELIVERY_DAY_LABELS = {
    "monday": "Lunes",
    "tuesday": "Martes",
    "wednesday": "Miércoles",
    "thursday": "Jueves",
    "friday": "Viernes",
    "saturday": "Sábado",
    "sunday": "Domingo",
}


def _html_text(value: object) -> str:
    return escape(str(value or ""))


def _order_whatsapp_message(sale_data: dict) -> str:
    items = sale_data.get("items") or [{
        "name": sale_data.get("perfume_name", "Perfume"),
        "quantity": sale_data.get("quantity", 1),
    }]
    products = ", ".join(
        f"{item.get('name', 'Perfume')} × {item.get('quantity', 1)}"
        for item in items
    )
    address = sale_data.get("preferred_delivery_address") or sale_data.get("address") or "Por confirmar"
    day = DELIVERY_DAY_LABELS.get(sale_data.get("delivery_day"), "")
    start = sale_data.get("delivery_start_time") or ""
    end = sale_data.get("delivery_end_time") or ""
    if day and start and end:
        schedule = f"{day}, de {start} a {end}"
    elif start and end:
        schedule = f"de {start} a {end}"
    else:
        schedule = "por confirmar"

    if sale_data.get("delivery_type") == "local":
        delivery_text = f"Te esperamos en {address}, en horario de {schedule}."
    else:
        delivery_text = f"La dirección de envío registrada es {address}. El horario se coordinará con paquetería."

    folio = sale_data.get("folio", "")
    return (
        f"Hola, te confirmamos tu pedido {folio}.\n"
        f"{delivery_text}\n"
        f"Los perfumes de tu pedido son: {products}."
    )


def _whatsapp_phone_link(phone: str, message: str = "") -> str:
    """Format a customer phone as a Telegram HTML link to WhatsApp."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        digits = f"52{digits}"
    elif digits.startswith("521") and len(digits) == 13:
        digits = f"52{digits[-10:]}"

    # wa.me expects an international number without a leading plus sign.
    if not 11 <= len(digits) <= 15:
        return escape(phone or "")
    message_query = f"?text={quote(message, safe='')}" if message else ""
    url = escape(f"https://wa.me/{digits}{message_query}", quote=True)
    return f'<a href="{url}">{escape(phone or digits)}</a>'


@celery_app.task(name="notify_new_sale")
def notify_new_sale(sale_data: dict):
    items = sale_data.get("items") or [{
        "name": sale_data.get("perfume_name", "Perfume"),
        "quantity": sale_data.get("quantity", 1),
    }]
    items_text = "\n".join(
        f"• {_html_text(item.get('name', 'Perfume'))} × {_html_text(item.get('quantity', 1))}"
        for item in items
    )
    text = (
        "🌸 <b>Nueva venta registrada en Scentia</b>\n\n"
        f"<b>Folio:</b> {sale_data['folio']}\n"
        f"<b>Productos:</b>\n{items_text}\n"
        f"<b>Total:</b> ${sale_data['total']:.2f}\n\n"
        f"<b>Comprador:</b> {_html_text(sale_data.get('buyer_name'))}\n"
        f"<b>WhatsApp:</b> {_whatsapp_phone_link(sale_data.get('buyer_phone', ''), _order_whatsapp_message(sale_data))}\n"
        f"<b>Dirección:</b> {_html_text(sale_data.get('address'))}\n"
        f"<b>Entrega:</b> {_html_text(sale_data.get('delivery_type', 'shipping'))}\n"
        f"<b>Ubicación preferida:</b> {_html_text(sale_data.get('preferred_location', 'Por paquetería'))}\n"
        "<i>Confirma el lugar y horario desde el panel de pedidos.</i>\n"
    )
    telegram_sent = send_telegram_message(text)
    if not telegram_sent:
        logger.warning("No se pudo entregar por Telegram la notificación del pedido %s", sale_data["folio"])
    whatsapp_sent = send_new_order_whatsapp(sale_data)
    if not whatsapp_sent:
        logger.warning("No se pudo entregar por WhatsApp la notificación del pedido %s", sale_data["folio"])
    return {
        "ok": telegram_sent or whatsapp_sent,
        "telegram": telegram_sent,
        "whatsapp": whatsapp_sent,
        "folio": sale_data["folio"],
    }


@celery_app.task(name="notify_delivery_confirmed")
def notify_delivery_confirmed(delivery_data: dict):
    if delivery_data.get("scheduled_at"):
        scheduled = datetime.fromisoformat(delivery_data["scheduled_at"]).astimezone(ZoneInfo("America/Mexico_City"))
        schedule_text = f"<b>Fecha y hora acordadas:</b> {_html_text(scheduled.strftime('%d/%m/%Y %H:%M'))}"
    else:
        day = DELIVERY_DAY_LABELS.get(delivery_data.get("delivery_day", ""), "Por confirmar")
        start = delivery_data.get("delivery_start_time", "")
        end = delivery_data.get("delivery_end_time", "")
        schedule_text = f"<b>Día habitual:</b> {_html_text(day)}\n<b>Horario:</b> {_html_text(start)}–{_html_text(end)}"
    whatsapp_data = {
        **delivery_data,
        "delivery_type": "local",
        "preferred_delivery_address": delivery_data.get("address"),
    }
    text = (
        "📍 <b>Entrega local confirmada</b>\n\n"
        f"<b>Folio:</b> {delivery_data['folio']}\n"
        f"<b>Comprador:</b> {_html_text(delivery_data.get('buyer_name'))}\n"
        f"<b>WhatsApp:</b> {_whatsapp_phone_link(delivery_data.get('buyer_phone', ''), _order_whatsapp_message(whatsapp_data))}\n"
        f"<b>Lugar:</b> {_html_text(delivery_data.get('location'))}\n"
        f"<b>Dirección:</b> {_html_text(delivery_data.get('address'))}\n"
        f"{schedule_text}\n"
    )
    sent = send_telegram_message(text)
    if not sent:
        logger.warning("No se pudo entregar por Telegram la confirmación del pedido %s", delivery_data["folio"])
    return {"ok": sent, "folio": delivery_data["folio"]}
