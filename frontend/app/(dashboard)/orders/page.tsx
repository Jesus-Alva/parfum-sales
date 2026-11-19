"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, QrCode, X } from "lucide-react";
import { api } from "@/lib/api";
import LocationMap from "@/components/shared/LocationMap";
import OrderQRScanner from "@/components/sales/OrderQRScanner";

type Location = { id: number; name: string; address: string; city: string; state: string; latitude: number; longitude: number; notes: string; delivery_day?: string | null; delivery_start_time?: string | null; delivery_end_time?: string | null };
type OrderItem = { perfume: { id: number; name: string; brand: string; image_url: string }; quantity: number; unit_price: number };
type Order = { id: number; folio: string; buyer_name: string; buyer_phone: string; quantity: number; total: number; status: string; delivery_type: string; created_at: string; delivery_scheduled_at?: string | null; preferred_delivery_location?: Location | null; delivery_location?: Location | null; perfume?: { name: string }; items?: OrderItem[]; address: { street: string; number: string; city: string; state: string; postal_code: string; country: string; references: string; latitude?: number | null; longitude?: number | null } };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [folio, setFolio] = useState("");
  const [locationId, setLocationId] = useState("");
  const [error, setError] = useState("");
  const [completedFolio, setCompletedFolio] = useState("");
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lookingUpQr, setLookingUpQr] = useState(false);

  const refresh = async () => {
    const [{ data: ordersData }, { data: locationsData }] = await Promise.all([
      api.get("/sales/orders"), api.get("/delivery-locations/admin"),
    ]);
    setOrders(ordersData);
    setLocations(locationsData.filter((location: Location & { is_active?: boolean }) => location.is_active));
  };

  useEffect(() => { refresh().catch(() => setError("No se pudieron cargar los pedidos")); }, []);

  useEffect(() => {
    if (!completedFolio) return;
    const timer = window.setTimeout(() => setCompletedFolio(""), 6000);
    return () => window.clearTimeout(timer);
  }, [completedFolio]);

  const filtered = useMemo(() => orders.filter((order) => order.folio.toLowerCase().includes(folio.trim().toLowerCase())), [orders, folio]);

  const chooseOrder = (order: Order) => {
    setSelected(order);
    setError("");
    setLocationId(String(order.delivery_location?.id ?? order.preferred_delivery_location?.id ?? ""));
  };

  const handleQrScan = async (rawValue: string) => {
    let scannedFolio = rawValue.trim();
    try {
      if (/^https?:\/\//i.test(scannedFolio)) {
        const url = new URL(scannedFolio);
        scannedFolio = url.searchParams.get("folio") || decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
      }
    } catch { /* The QR contains a plain folio, not a URL. */ }
    scannedFolio = scannedFolio.replace(/^SCN(?:-ORDER)?:/i, "").trim();
    if (!scannedFolio) {
      setError("El QR no contiene un folio de pedido válido.");
      return;
    }

    setShowScanner(false);
    setLookingUpQr(true);
    setError("");
    setFolio(scannedFolio);
    try {
      const { data } = await api.get<Order>(`/sales/orders/qr/${encodeURIComponent(scannedFolio)}`);
      setOrders((current) => current.some((order) => order.id === data.id) ? current : [data, ...current]);
      chooseOrder(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "No se encontró un pedido para ese código QR.");
    } finally {
      setLookingUpQr(false);
    }
  };

  const confirm = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const { data } = await api.patch(`/sales/${selected.id}/delivery`, {
        delivery_location_id: locationId ? Number(locationId) : null,
      });
      setSelected(data); await refresh();
    } catch (e: any) { setError(e?.response?.data?.detail || "No se pudo confirmar la entrega"); }
    finally { setSaving(false); }
  };

  const complete = async () => {
    if (!selected) return;
    const folioToComplete = selected.folio;
    setSaving(true); setError("");
    try {
      await api.post(`/sales/${selected.id}/complete`);
      setSelected(null);
      setCompletedFolio(folioToComplete);
      try { await refresh(); }
      catch { setError("La entrega finalizó, pero no se pudo actualizar la lista de pedidos."); }
    } catch (e: any) { setError(e?.response?.data?.detail || "No se pudo completar el pedido"); }
    finally { setSaving(false); }
  };

  const point = locations.find((location) => String(location.id) === locationId) || selected?.delivery_location || selected?.preferred_delivery_location;
  const dayLabels: Record<string, string> = { monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado", sunday: "Domingo" };
  const hasDeliveryWindow = Boolean(point?.delivery_day && point.delivery_start_time && point.delivery_end_time);
  const input = "w-full rounded-lg border border-scentia-border bg-scentia-card px-3 py-2 text-sm text-scentia-text focus:border-scentia-gold focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.25em] text-scentia-muted">Operación</p><h1 className="font-display text-3xl text-gradient-gold">Pedidos</h1></div><button type="button" onClick={() => { setError(""); setShowScanner(true); }} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-4 py-2.5 text-sm font-semibold text-black"><QrCode size={17} /> Escanear QR</button></div>
      {completedFolio && <div role="status" aria-live="polite" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100"><div className="flex items-center gap-3"><CheckCircle2 className="shrink-0 text-emerald-300" size={20} /><span><strong>Entrega finalizada.</strong> El pedido <span className="font-mono">{completedFolio}</span> quedó marcado como entregado.</span></div><button type="button" onClick={() => setCompletedFolio("")} className="rounded-md p-1 text-emerald-200 transition hover:bg-emerald-300/10" aria-label="Cerrar aviso"><X size={17} /></button></div>}
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {lookingUpQr && <p role="status" className="text-sm text-scentia-muted">Buscando pedido escaneado…</p>}
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
          {!selected ? <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"><span className="mb-3 text-3xl">⌕</span><h2 className="font-display text-xl text-scentia-gold">Detalle del pedido</h2><p className="mt-2 max-w-sm text-sm text-scentia-muted">Elige un pedido de la lista o escanea su código QR para consultar sus productos.</p></div> : <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-scentia-muted">Folio</p><h2 className="font-mono text-xl text-scentia-gold">{selected.folio}</h2></div><span className={`rounded-full border px-3 py-1 text-xs ${selected.status === "delivered" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>{selected.status === "delivered" ? "Entregado" : selected.status === "ready_for_delivery" ? "Listo para entregar" : "Pendiente de entrega"}</span></div>
            <div className="grid gap-3 rounded-xl border border-scentia-border bg-scentia-card/50 p-4 sm:grid-cols-2"><Info label="Comprador" value={selected.buyer_name} /><Info label="Teléfono" value={selected.buyer_phone} /><Info label="Total" value={`$${Number(selected.total).toFixed(2)}`} /><Info label="Modalidad" value={selected.delivery_type === "local" ? "Entrega local" : "Paquetería"} /><Info label="Domicilio" value={`${selected.address.street} ${selected.address.number}, ${selected.address.city}, ${selected.address.state}`} /></div>

            <div className="rounded-xl border border-scentia-border p-4"><h3 className="mb-3 font-display text-lg text-scentia-gold">Productos del pedido</h3>{selected.items?.length ? <ul className="divide-y divide-scentia-border">{selected.items.map((item) => <li key={item.perfume.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.perfume.name}</p><p className="text-xs text-scentia-muted">{item.perfume.brand} · {item.quantity} {item.quantity === 1 ? "pieza" : "piezas"}</p></div><p className="shrink-0 text-sm">${(Number(item.unit_price) * item.quantity).toFixed(2)}</p></li>)}</ul> : <p className="text-sm text-scentia-muted">{selected.perfume?.name || "Perfume"} · {selected.quantity} pza.</p>}</div>

            {selected.delivery_type === "local" ? <div className="space-y-4 rounded-xl border border-scentia-border p-4"><div><h3 className="font-display text-lg text-scentia-gold">Confirmar entrega</h3><p className="text-xs text-scentia-muted">Se usará el día y rango horario habitual del punto elegido.</p></div><label className="block text-sm text-scentia-muted">Ubicación<select className={`${input} mt-1`} value={locationId} onChange={(e) => setLocationId(e.target.value)}><option value="">Selecciona una ubicación</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.name} · {location.address}</option>)}</select></label>{point && <div className="rounded-lg border border-scentia-border bg-scentia-card/50 p-3 text-sm"><p className="text-xs text-scentia-muted">Horario habitual</p><p className="mt-1 text-scentia-gold">{hasDeliveryWindow ? `${dayLabels[point.delivery_day!] || point.delivery_day} · ${point.delivery_start_time?.slice(0, 5)}–${point.delivery_end_time?.slice(0, 5)}` : "Pendiente de configurar en Ubicaciones"}</p></div>}{point && <LocationMap latitude={point.latitude} longitude={point.longitude} label={point.name} />}</div> : <div className="space-y-3 rounded-xl border border-scentia-border p-4"><div><h3 className="font-display text-lg text-scentia-gold">Envío por paquetería</h3><p className="mt-1 text-sm text-scentia-muted">{selected.address.street} {selected.address.number}, {selected.address.city}, {selected.address.state} {selected.address.postal_code}</p><p className="mt-2 text-xs text-scentia-muted">Confirma el pedido cuando esté listo para enviar. Márcalo como entregado al completar la entrega.</p></div>{selected.address.latitude != null && selected.address.longitude != null && <LocationMap latitude={selected.address.latitude} longitude={selected.address.longitude} label="Domicilio de envío" />}</div>}

            {selected.status !== "delivered" && <div className="flex flex-wrap gap-3"><button onClick={confirm} disabled={saving || (selected.delivery_type === "local" && (!locationId || !hasDeliveryWindow))} className="rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">{selected.status === "ready_for_delivery" ? "Actualizar confirmación" : selected.delivery_type === "local" ? "Confirmar punto de entrega" : "Confirmar pedido"}</button><button onClick={complete} disabled={saving || (selected.delivery_type === "local" && selected.status !== "ready_for_delivery")} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50">Realizar entrega · Finalizar</button></div>}
          </div>}
        </section>
      </div>
      {showScanner && <OrderQRScanner onScan={handleQrScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-scentia-muted">{label}</p><p className="mt-1 text-sm">{value}</p></div>; }
