import random
import string
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.perfume import Perfume
from app.models.sale import Sale
from app.models.address import Address
from app.schemas.sale import SaleCreate


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
        status="registered",
    )

    perfume.stock -= payload.quantity
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale