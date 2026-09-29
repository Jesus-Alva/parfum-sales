"use client";

export default function SaleDetail({ sale }: { sale: any }) {
  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-scentia-gold mb-1">Folio</p>
      <h1 className="font-mono text-2xl text-gradient-gold mb-6">{sale.folio}</h1>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <Info label="Comprador" value={sale.buyer_name} />
        <Info label="Teléfono" value={sale.buyer_phone} />
        <Info label="Cantidad" value={sale.quantity} />
        <Info label="Total" value={`$${sale.total.toFixed(2)}`} />
        <Info label="Estado" value={sale.status} />
        <Info label="Fecha" value={new Date(sale.created_at).toLocaleString()} />
      </div>

      <h3 className="font-display text-lg mb-2">Dirección</h3>
      <p className="text-scentia-muted text-sm">
        {sale.address.street} {sale.address.number}, {sale.address.city},{" "}
        {sale.address.state} {sale.address.postal_code}, {sale.address.country}
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-scentia-muted">{label}</p>
      <p>{value}</p>
    </div>
  );
}