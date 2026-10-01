from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.celery_app import celery_app
from app.services.telegram_service import send_telegram_message


@celery_app.task(name="notify_new_sale")
def notify_new_sale(sale_data: dict):
    text = (
        "🌸 <b>Nueva venta registrada en Scentia</b>\n\n"
        f"<b>Folio:</b> {sale_data['folio']}\n"
        f"<b>Perfume:</b> {sale_data['perfume_name']}\n"
        f"<b>Cantidad:</b> {sale_data['quantity']}\n"
        f"<b>Total:</b> ${sale_data['total']:.2f}\n\n"
        f"<b>Comprador:</b> {sale_data['buyer_name']}\n"
        f"<b>Teléfono:</b> {sale_data['buyer_phone']}\n"
        f"<b>Dirección:</b> {sale_data['address']}\n"
        f"<b>Entrega:</b> {sale_data.get('delivery_type', 'shipping')}\n"
        f"<b>Ubicación preferida:</b> {sale_data.get('preferred_location', 'Por paquetería')}\n"
        "<i>Confirma el lugar y horario desde el panel de pedidos.</i>\n"
    )
    send_telegram_message(text)
    return {"ok": True, "folio": sale_data["folio"]}


@celery_app.task(name="notify_delivery_confirmed")
def notify_delivery_confirmed(delivery_data: dict):
    scheduled = datetime.fromisoformat(delivery_data["scheduled_at"]).astimezone(ZoneInfo("America/Mexico_City"))
    text = (
        "📍 <b>Entrega local confirmada</b>\n\n"
        f"<b>Folio:</b> {delivery_data['folio']}\n"
        f"<b>Comprador:</b> {delivery_data['buyer_name']}\n"
        f"<b>Teléfono:</b> {delivery_data['buyer_phone']}\n"
        f"<b>Lugar:</b> {delivery_data['location']}\n"
        f"<b>Dirección:</b> {delivery_data['address']}\n"
        f"<b>Fecha y hora:</b> {scheduled.strftime('%d/%m/%Y %H:%M')}\n"
    )
    send_telegram_message(text)
    return {"ok": True, "folio": delivery_data["folio"]}
