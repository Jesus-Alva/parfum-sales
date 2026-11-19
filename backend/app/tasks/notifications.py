from datetime import datetime
from zoneinfo import ZoneInfo
import logging

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


@celery_app.task(name="notify_new_sale")
def notify_new_sale(sale_data: dict):
    items = sale_data.get("items") or [{
        "name": sale_data.get("perfume_name", "Perfume"),
        "quantity": sale_data.get("quantity", 1),
    }]
    items_text = "\n".join(f"• {item['name']} × {item['quantity']}" for item in items)
    text = (
        "🌸 <b>Nueva venta registrada en Scentia</b>\n\n"
        f"<b>Folio:</b> {sale_data['folio']}\n"
        f"<b>Productos:</b>\n{items_text}\n"
        f"<b>Total:</b> ${sale_data['total']:.2f}\n\n"
        f"<b>Comprador:</b> {sale_data['buyer_name']}\n"
        f"<b>Teléfono:</b> {sale_data['buyer_phone']}\n"
        f"<b>Dirección:</b> {sale_data['address']}\n"
        f"<b>Entrega:</b> {sale_data.get('delivery_type', 'shipping')}\n"
        f"<b>Ubicación preferida:</b> {sale_data.get('preferred_location', 'Por paquetería')}\n"
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
        schedule_text = f"<b>Fecha y hora acordadas:</b> {scheduled.strftime('%d/%m/%Y %H:%M')}"
    else:
        day = DELIVERY_DAY_LABELS.get(delivery_data.get("delivery_day", ""), "Por confirmar")
        start = delivery_data.get("delivery_start_time", "")
        end = delivery_data.get("delivery_end_time", "")
        schedule_text = f"<b>Día habitual:</b> {day}\n<b>Horario:</b> {start}–{end}"
    text = (
        "📍 <b>Entrega local confirmada</b>\n\n"
        f"<b>Folio:</b> {delivery_data['folio']}\n"
        f"<b>Comprador:</b> {delivery_data['buyer_name']}\n"
        f"<b>Teléfono:</b> {delivery_data['buyer_phone']}\n"
        f"<b>Lugar:</b> {delivery_data['location']}\n"
        f"<b>Dirección:</b> {delivery_data['address']}\n"
        f"{schedule_text}\n"
    )
    sent = send_telegram_message(text)
    if not sent:
        logger.warning("No se pudo entregar por Telegram la confirmación del pedido %s", delivery_data["folio"])
    return {"ok": sent, "folio": delivery_data["folio"]}
