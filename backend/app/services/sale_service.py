import random
import string
import unicodedata
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.perfume import Perfume
from app.models.sale import Sale
from app.models.sale import SaleItem
from app.models.address import Address
from app.schemas.sale import SaleCreate
from app.models.delivery_location import DeliveryLocation
from app.config import settings


def generate_folio() -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SCN-{ts}-{rand}"


def create_sale(db: Session, payload: SaleCreate) -> Sale:
    quantities: dict[int, int] = {}
    for item in payload.items:
        quantities[item.perfume_id] = quantities.get(item.perfume_id, 0) + item.quantity

    perfumes = db.query(Perfume).filter(Perfume.id.in_(quantities)).all()
    perfumes_by_id = {perfume.id: perfume for perfume in perfumes}
    if len(perfumes_by_id) != len(quantities):
        raise ValueError("Uno o más perfumes no existen")
    for perfume_id, quantity in quantities.items():
        if perfumes_by_id[perfume_id].stock < quantity:
            raise ValueError(f"Stock insuficiente para {perfumes_by_id[perfume_id].name}")

    first_item = payload.items[0]
    first_perfume = perfumes_by_id[first_item.perfume_id]
    total = sum(perfumes_by_id[item.perfume_id].price * item.quantity for item in payload.items)

    def normalize(value: str) -> str:
        plain = unicodedata.normalize("NFKD", value or "")
        return "".join(c for c in plain if not unicodedata.combining(c)).strip().casefold()

    local = bool(settings.BUSINESS_CITY) and normalize(payload.address.city) == normalize(settings.BUSINESS_CITY)
    if local and settings.BUSINESS_STATE:
        if not payload.address.state:
            raise ValueError("Indica el estado para confirmar si la entrega es local")
        local = normalize(payload.address.state) == normalize(settings.BUSINESS_STATE)
    preferred_location = None
    if local:
        if not payload.preferred_delivery_location_id:
            raise ValueError("Selecciona un punto de entrega disponible")
        preferred_location = db.query(DeliveryLocation).filter(
            DeliveryLocation.id == payload.preferred_delivery_location_id,
            DeliveryLocation.is_active.is_(True),
        ).first()
        if not preferred_location:
            raise ValueError("El punto de entrega ya no está disponible")

    address = Address(**payload.address.model_dump())
    db.add(address)
    db.flush()

    sale = Sale(
        folio=generate_folio(),
        perfume_id=first_perfume.id,
        buyer_name=payload.buyer_name,
        buyer_phone=payload.buyer_phone,
        address_id=address.id,
        quantity=sum(quantities.values()),
        unit_price=first_perfume.price,
        total=total,
        status="pending_delivery",
        delivery_type="local" if local else "shipping",
        preferred_delivery_location_id=preferred_location.id if preferred_location else None,
    )

    db.add(sale)
    db.flush()
    for item in payload.items:
        perfume = perfumes_by_id[item.perfume_id]
        db.add(SaleItem(sale_id=sale.id, perfume_id=perfume.id, quantity=item.quantity, unit_price=perfume.price))
    for perfume_id, quantity in quantities.items():
        perfumes_by_id[perfume_id].stock -= quantity
    db.commit()
    db.refresh(sale)
    return sale
