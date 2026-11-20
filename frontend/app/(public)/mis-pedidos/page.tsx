"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageSearch, QrCode, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Order = {
  id: number;
  folio: string;
  total: number;
  status: string;
  delivery_type: string;
  created_at: string;
  delivery_scheduled_at?: string | null;
  preferred_delivery_location?: { name: string; address: string; city: string; delivery_day?: string | null; delivery_start_time?: string | null; delivery_end_time?: string | null } | null;
  delivery_location?: { name: string; address: string; city: string; delivery_day?: string | null; delivery_start_time?: string | null; delivery_end_time?: string | null } | null;
  items: { perfume: { name: string }; quantity: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending_delivery: "Pendiente de confirmar",
  ready_for_delivery: "Entrega confirmada",
  delivered: "Entregado",
  cancelled: "Cancelado",
};
const DELIVERY_DAY_LABELS: Record<string, string> = { monday: "lunes", tuesday: "martes", wednesday: "miércoles", thursday: "jueves", friday: "viernes", saturday: "sábado", sunday: "domingo" };

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [visibleQr, setVisibleQr] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!getToken()) {
      setSignedIn(false);
      setLoading(false);
      router.replace("/login");
      return;
    }
    setSignedIn(true);
    api.get("/sales/my-orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("No pudimos cargar tus pedidos. Intenta de nuevo más tarde."))
      .finally(() => setLoading(false));
  }, [router]);

  const cancelOrder = async (order: Order) => {
    if (!window.confirm(`¿Cancelar el pedido ${order.folio}? Se devolverán sus productos al inventario.`)) return;
    setCancellingId(order.id);
    setActionMessage("");
    try {
      const { data } = await api.post(`/sales/${order.id}/cancel`);
      setOrders((current) => current.map((item) => item.id === order.id ? data : item));
      setActionMessage(`El pedido ${order.folio} quedó cancelado.`);
    } catch (e: any) {
      setActionMessage(e?.response?.data?.detail || "No se pudo cancelar el pedido.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="mx-auto min-h-[60vh] max-w-5xl px-6 py-10 md:py-14">
      <div className="mb-8 flex items-center gap-3">
        <PackageSearch className="text-scentia-gold" size={28} />
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-scentia-muted">Tu cuenta</p>
          <h1 className="font-display text-3xl text-gradient-gold">Mis pedidos</h1>
        </div>
      </div>

      {!signedIn || loading ? (
        <p className="text-scentia-muted">Cargando tus pedidos…</p>
      ) : error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-scentia-border bg-scentia-card/40 p-8 text-center">
          <p className="text-scentia-muted">Aún no tienes pedidos asociados a esta cuenta.</p>
          <Link href="/catalogo" className="mt-5 inline-flex rounded-full border border-scentia-gold/40 px-5 py-2.5 font-semibold text-scentia-gold transition hover:bg-scentia-gold/10">Explorar catálogo</Link>
        </section>
      ) : (
        <div className="space-y-4">
          {actionMessage && <p role="status" className="rounded-lg border border-scentia-border bg-scentia-card/50 p-3 text-sm text-scentia-muted">{actionMessage}</p>}
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-scentia-border bg-scentia-card/40 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs text-scentia-muted">Folio</p>
                  <p className="font-mono text-lg text-scentia-gold">{order.folio}</p>
                  <p className="mt-1 text-xs text-scentia-muted">{new Date(order.created_at).toLocaleString("es-MX")}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full border px-3 py-1 ${order.status === "cancelled" ? "border-red-400/30 bg-red-400/10 text-red-200" : order.status === "delivered" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-scentia-gold/30 bg-scentia-gold/5 text-scentia-gold"}`}>{STATUS_LABELS[order.status] || order.status}</span>
                  <span className="rounded-full border border-scentia-border px-3 py-1 text-scentia-muted">{order.delivery_type === "local" ? "Entrega local" : "Paquetería"}</span>
                </div>
              </div>
              <div className="mt-4 border-t border-scentia-border pt-4">
                <p className="text-sm text-scentia-muted">{order.items?.map((item) => `${item.perfume.name} × ${item.quantity}`).join(" · ")}</p>
                {(order.delivery_location || order.preferred_delivery_location) && (() => { const location = order.delivery_location || order.preferred_delivery_location!; const schedule = location.delivery_day && location.delivery_start_time && location.delivery_end_time ? ` · ${DELIVERY_DAY_LABELS[location.delivery_day] || location.delivery_day}, ${location.delivery_start_time.slice(0, 5)}–${location.delivery_end_time.slice(0, 5)}` : ""; return <p className="mt-2 text-xs text-scentia-muted">Entrega en {location.name}, {location.address}, {location.city}{schedule}{order.delivery_scheduled_at ? ` · ${new Date(order.delivery_scheduled_at).toLocaleString("es-MX")}` : ""}</p>; })()}
                <p className="mt-3 text-right font-semibold text-scentia-gold">Total: ${Number(order.total).toFixed(2)}</p>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {order.status !== "cancelled" && order.status !== "delivered" && <button type="button" onClick={() => cancelOrder(order)} disabled={cancellingId === order.id} className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-200 transition hover:bg-red-400/10 disabled:opacity-50">
                    <XCircle size={16} /> {cancellingId === order.id ? "Cancelando…" : "Cancelar pedido"}
                  </button>}
                  <button type="button" onClick={() => setVisibleQr((current) => current === order.id ? null : order.id)} className="inline-flex items-center gap-2 rounded-lg border border-scentia-gold/40 px-3 py-2 text-sm text-scentia-gold transition hover:bg-scentia-gold/10" aria-expanded={visibleQr === order.id}>
                    <QrCode size={16} /> {visibleQr === order.id ? "Ocultar QR" : "Mostrar QR del pedido"}
                  </button>
                </div>
                {visibleQr === order.id && <div className="mt-4 flex flex-col items-center rounded-xl border border-scentia-border bg-scentia-card/50 p-4">
                  <div className="rounded-lg bg-white p-3"><QRCodeSVG value={order.folio} size={176} level="M" includeMargin /></div>
                  <p className="mt-3 text-center text-xs text-scentia-muted">Muestra este código al administrador para consultar los productos del pedido.</p>
                </div>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
