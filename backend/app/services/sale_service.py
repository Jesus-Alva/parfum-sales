import random
import string
import unicodedata
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.perfume import Perfume
from app.models.sale import Sale
from app.models.address import Address
from app.schemas.sale import SaleCreate
from app.models.delivery_location import DeliveryLocation
from app.config import settings


def generate_folio() -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SCN-{ts}-{rand}"


def create_sale(db: Session, payload: SaleCreate) -> Sale:
    perfume = db.query(Perfume).filter(Perfume.id == payload.perfume_id).first()
    if not perfume:
        raise ValueError("Perfume no encontrado")
    if perfume.stock < payload.quantity:
        raise ValueError("Stock insuficiente")

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
        perfume_id=perfume.id,
        buyer_name=payload.buyer_name,
        buyer_phone=payload.buyer_phone,
        address_id=address.id,
        quantity=payload.quantity,
        unit_price=perfume.price,
        total=perfume.price * payload.quantity,
        status="pending_delivery",
        delivery_type="local" if local else "shipping",
        preferred_delivery_location_id=preferred_location.id if preferred_location else None,
    )

    perfume.stock -= payload.quantity
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale
