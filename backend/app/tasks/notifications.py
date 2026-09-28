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
    )
    send_telegram_message(text)
    return {"ok": True, "folio": sale_data["folio"]}