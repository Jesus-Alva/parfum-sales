from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sale import Sale
from app.models.perfume import Perfume
from app.tasks.notifications import send_telegram_sale_notification
import uuid


async def create_sale(
    db: AsyncSession,
    perfume_id: int,
    buyer_name: str,
    phone: str,
    address: str,
    user_id: int,
):
    # Obtener perfume
    perfume = await db.get(Perfume, perfume_id)
    if not perfume:
        raise ValueError("Perfume no encontrado")
    if perfume.stock <= 0:
        raise ValueError("Sin stock disponible")

    # Generar folio único
    folio = f"PF-{uuid.uuid4().hex[:8].upper()}"

    # Crear registro de venta
    sale = Sale(
        folio=folio,
        perfume_id=perfume_id,
        buyer_name=buyer_name,
        phone=phone,
        address=address,
        price=perfume.price,
        user_id=user_id,
    )
    db.add(sale)
    perfume.stock -= 1
    await db.commit()
    await db.refresh(sale)

    # Disparar notificación asíncrona vía Celery
    send_telegram_sale_notification.delay({
        "folio": sale.folio,
        "perfume_name": perfume.name,
        "price": float(sale.price),
        "buyer_name": sale.buyer_name,
        "phone": sale.phone,
        "address": sale.address,
        "created_at": sale.created_at.strftime("%Y-%m-%d %H:%M"),
    })

    return sale