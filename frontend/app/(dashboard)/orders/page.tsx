"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import LocationMap from "@/components/shared/LocationMap";

type Location = { id: number; name: string; address: string; city: string; state: string; latitude: number; longitude: number; notes: string };
type Order = { id: number; folio: string; buyer_name: string; buyer_phone: string; quantity: number; total: number; status: string; delivery_type: string; created_at: string; delivery_scheduled_at?: string | null; preferred_delivery_location?: Location | null; delivery_location?: Location | null; perfume?: { name: string }; items?: { perfume: { name: string }; quantity: number }[]; address: { street: string; number: string; city: string; state: string; postal_code: string; country: string; references: string; latitude?: number | null; longitude?: number | null } };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [folio, setFolio] = useState("");
  const [locationId, setLocationId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const [{ data: ordersData }, { data: locationsData }] = await Promise.all([
      api.get("/sales/orders"), api.get("/delivery-locations/admin"),
    ]);
    setOrders(ordersData);
    setLocations(locationsData.filter((location: Location & { is_active?: boolean }) => location.is_active));
  };

  useEffect(() => { refresh().catch(() => setError("No se pudieron cargar los pedidos")); }, []);

  const filtered = useMemo(() => orders.filter((order) => order.folio.toLowerCase().includes(folio.trim().toLowerCase())), [orders, folio]);

  const chooseOrder = (order: Order) => {
    setSelected(order);
    setError("");
    setLocationId(String(order.delivery_location?.id ?? order.preferred_delivery_location?.id ?? ""));
    if (order.delivery_scheduled_at) {
      const localDate = new Date(new Date(order.delivery_scheduled_at).getTime() - new Date(order.delivery_scheduled_at).getTimezoneOffset() * 60_000);
      const localValue = localDate.toISOString().slice(0, 16);
      setScheduledDate(localValue.slice(0, 10));
      setScheduledTime(localValue.slice(11, 16));
    } else {
      setScheduledDate("");
      setScheduledTime("");
    }
  };

  const confirm = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const { data } = await api.patch(`/sales/${selected.id}/delivery`, {
        delivery_location_id: locationId ? Number(locationId) : null,
        delivery_scheduled_at: scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : null,
      });
      setSelected(data); await refresh();
    } catch (e: any) { setError(e?.response?.data?.detail || "No se pudo confirmar la entrega"); }
    finally { setSaving(false); }
  };

  const complete = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      await api.post(`/sales/${selected.id}/complete`);
      setSelected(null); await refresh();
    } catch (e: any) { setError(e?.response?.data?.detail || "No se pudo completar el pedido"); }
    finally { setSaving(false); }
  };

  const point = selected?.delivery_location || selected?.preferred_delivery_location;
  const today = new Date();
  const minDeliveryDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  const input = "w-full rounded-lg border border-scentia-border bg-scentia-card px-3 py-2 text-sm text-scentia-text focus:border-scentia-gold focus:outline-none";

  return (
    <div className="space-y-6">
      <div><p className="text-xs uppercase tracking-[0.25em] text-scentia-muted">Operación</p><h1 className="font-display text-3xl text-gradient-gold">Pedidos</h1></div>
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <section className="glass rounded-2xl p-5">
          <label className="mb-4 block text-sm text-scentia-muted">Buscar pedido por folio<input value={folio} onChange={(e) => setFolio(e.target.value)} placeholder="SCN-20261001-AB12" className={`${input} mt-2 font-mono`} /></label>
          <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? <p className="py-8 text-center text-sm text-scentia-muted">No hay pedidos pendientes.</p> : filtered.map((order) => (
              <button key={order.id} onClick={() => chooseOrder(order)} className={`w-full rounded-xl border p-4 text-left transition ${selected?.id === order.id ? "border-scentia-gold/60 bg-scentia-gold/10" : "border-scentia-border bg-scentia-card/50 hover:border-scentia-gold/30"}`}>
                <span className="flex items-center justify-between gap-3"><span className="font-mono text-sm text-scentia-gold">{order.folio}</span><span className="rounded-full border border-scentia-gold/20 px-2 py-1 text-[10px] uppercase text-scentia-muted">{order.delivery_type === "local" ? "Local" : "Paquetería"}</span></span>
                <span className="mt-2 block text-sm">{order.buyer_name}</span><span className="mt-1 block text-xs text-scentia-muted">${Number(order.total).toFixed(2)} · {new Date(order.created_at).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="glass min-h-[360px] rounded-2xl p-5 md:p-6">
          {!selected ? <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"><span className="mb-3 text-3xl">⌕</span><h2 className="font-display text-xl text-scentia-gold">Detalle del pedido</h2><p className="mt-2 max-w-sm text-sm text-scentia-muted">Elige un pedido de la lista o búscalo por folio para confirmar su entrega.</p></div> : <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-scentia-muted">Folio</p><h2 className="font-mono text-xl text-scentia-gold">{selected.folio}</h2></div><span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">{selected.status === "ready_for_delivery" ? "Listo para entregar" : "Pendiente de entrega"}</span></div>
            <div className="grid gap-3 rounded-xl border border-scentia-border bg-scentia-card/50 p-4 sm:grid-cols-2"><Info label="Comprador" value={selected.buyer_name} /><Info label="Teléfono" value={selected.buyer_phone} /><Info label="Productos" value={selected.items?.map((item) => `${item.perfume.name} × ${item.quantity}`).join(", ") || `${selected.perfume?.name || "Perfume"} · ${selected.quantity} pza.`} /><Info label="Total" value={`$${Number(selected.total).toFixed(2)}`} /><Info label="Modalidad" value={selected.delivery_type === "local" ? "Entrega local" : "Paquetería"} /><Info label="Domicilio" value={`${selected.address.street} ${selected.address.number}, ${selected.address.city}, ${selected.address.state}`} /></div>

            {selected.delivery_type === "local" ? <div className="space-y-4 rounded-xl border border-scentia-border p-4"><div><h3 className="font-display text-lg text-scentia-gold">Confirmar entrega</h3><p className="text-xs text-scentia-muted">Acordado con el comprador por Whatsapp.</p></div><label className="block text-sm text-scentia-muted">Ubicación<select className={`${input} mt-1`} value={locationId} onChange={(e) => setLocationId(e.target.value)}><option value="">Selecciona una ubicación</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.name} · {location.address}</option>)}</select></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm text-scentia-muted">Fecha<input aria-label="Fecha de entrega" className={`${input} mt-1 [color-scheme:dark]`} type="date" min={minDeliveryDate} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} /></label><label className="block text-sm text-scentia-muted">Hora<input aria-label="Hora de entrega" className={`${input} mt-1 [color-scheme:dark]`} type="time" step="60" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} /></label></div>{scheduledDate && scheduledDate < minDeliveryDate && <p className="text-xs text-red-300">La fecha de entrega no puede ser anterior a hoy.</p>}{point && <LocationMap latitude={point.latitude} longitude={point.longitude} label={point.name} />}</div> : <div className="space-y-3 rounded-xl border border-scentia-border p-4"><div><h3 className="font-display text-lg text-scentia-gold">Envío por paquetería</h3><p className="mt-1 text-sm text-scentia-muted">{selected.address.street} {selected.address.number}, {selected.address.city}, {selected.address.state} {selected.address.postal_code}</p><p className="mt-2 text-xs text-scentia-muted">Confirma el pedido cuando esté listo para enviar. Márcalo como entregado al completar la entrega.</p></div>{selected.address.latitude != null && selected.address.longitude != null && <LocationMap latitude={selected.address.latitude} longitude={selected.address.longitude} label="Domicilio de envío" />}</div>}

            <div className="flex flex-wrap gap-3"><button onClick={confirm} disabled={saving || (selected.delivery_type === "local" && (!locationId || !scheduledDate || scheduledDate < minDeliveryDate || !scheduledTime))} className="rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">{selected.status === "ready_for_delivery" ? "Actualizar confirmación" : selected.delivery_type === "local" ? "Confirmar lugar y horario" : "Confirmar pedido"}</button><button onClick={complete} disabled={saving || (selected.delivery_type === "local" && selected.status !== "ready_for_delivery")} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50">Realizar entrega · Finalizar</button></div>
          </div>}
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-scentia-muted">{label}</p><p className="mt-1 text-sm">{value}</p></div>; }
