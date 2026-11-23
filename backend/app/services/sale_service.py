import random
import string
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.perfume import Perfume
from app.models.sale import Sale
from app.models.sale import SaleItem
from app.models.address import Address
from app.schemas.sale import SaleCreate
from app.models.delivery_location import DeliveryLocation


def generate_folio() -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SCN-{ts}-{rand}"


def create_sale(db: Session, payload: SaleCreate, user_id: int | None = None) -> Sale:
    quantities: dict[int, int] = {}
    for item in payload.items:
        quantities[item.perfume_id] = quantities.get(item.perfume_id, 0) + item.quantity

    perfumes = db.query(Perfume).filter(Perfume.id.in_(quantities)).all()
    perfumes_by_id = {perfume.id: perfume for perfume in perfumes}
    if len(perfumes_by_id) != len(quantities):
        raise ValueError("Uno o más perfumes no existen")
    for perfume_id, quantity in quantities.items():
        if not perfumes_by_id[perfume_id].is_enabled:
            raise ValueError(f"La presentación {perfumes_by_id[perfume_id].name} ya no está disponible")
        if perfumes_by_id[perfume_id].stock < quantity:
            raise ValueError(f"Stock insuficiente para {perfumes_by_id[perfume_id].name}")

    first_item = payload.items[0]
    first_perfume = perfumes_by_id[first_item.perfume_id]
    total = sum(perfumes_by_id[item.perfume_id].discounted_price * item.quantity for item in payload.items)

    if not payload.preferred_delivery_location_id:
        raise ValueError("Selecciona un punto de entrega disponible. No se realizan envíos")
    preferred_location = db.query(DeliveryLocation).filter(
        DeliveryLocation.id == payload.preferred_delivery_location_id,
        DeliveryLocation.is_active.is_(True),
    ).first()
    if not preferred_location:
        raise ValueError("El punto de entrega ya no está disponible")
    if not preferred_location.delivery_day or not preferred_location.delivery_start_time or not preferred_location.delivery_end_time:
        raise ValueError("El punto de entrega aún no tiene un horario configurado")

    address = Address(**payload.address.model_dump())
    db.add(address)
    db.flush()

    sale = Sale(
        folio=generate_folio(),
        perfume_id=first_perfume.id,
        buyer_name=payload.buyer_name,
        buyer_phone=payload.buyer_phone,
        address_id=address.id,
        user_id=user_id,
        quantity=sum(quantities.values()),
        unit_price=first_perfume.discounted_price,
        total=total,
        status="pending_delivery",
        delivery_type="local",
        preferred_delivery_location_id=preferred_location.id,
    )

    db.add(sale)
    db.flush()
    for item in payload.items:
        perfume = perfumes_by_id[item.perfume_id]
        db.add(SaleItem(sale_id=sale.id, perfume_id=perfume.id, quantity=item.quantity, unit_price=perfume.discounted_price))
    for perfume_id, quantity in quantities.items():
        perfumes_by_id[perfume_id].stock -= quantity
    db.commit()
    db.refresh(sale)
    return sale
