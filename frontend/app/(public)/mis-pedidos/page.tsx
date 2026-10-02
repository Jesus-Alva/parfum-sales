"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";
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
  delivery_location?: { name: string; address: string; city: string } | null;
  items: { perfume: { name: string }; quantity: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending_delivery: "Pendiente de confirmar",
  ready_for_delivery: "Entrega confirmada",
  delivered: "Entregado",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");

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
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-scentia-border bg-scentia-card/40 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs text-scentia-muted">Folio</p>
                  <p className="font-mono text-lg text-scentia-gold">{order.folio}</p>
                  <p className="mt-1 text-xs text-scentia-muted">{new Date(order.created_at).toLocaleString("es-MX")}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-scentia-gold/30 bg-scentia-gold/5 px-3 py-1 text-scentia-gold">{STATUS_LABELS[order.status] || order.status}</span>
                  <span className="rounded-full border border-scentia-border px-3 py-1 text-scentia-muted">{order.delivery_type === "local" ? "Entrega local" : "Paquetería"}</span>
                </div>
              </div>
              <div className="mt-4 border-t border-scentia-border pt-4">
                <p className="text-sm text-scentia-muted">{order.items?.map((item) => `${item.perfume.name} × ${item.quantity}`).join(" · ")}</p>
                {order.delivery_location && <p className="mt-2 text-xs text-scentia-muted">Entrega en {order.delivery_location.name}, {order.delivery_location.address}, {order.delivery_location.city}{order.delivery_scheduled_at ? ` · ${new Date(order.delivery_scheduled_at).toLocaleString("es-MX")}` : ""}</p>}
                <p className="mt-3 text-right font-semibold text-scentia-gold">Total: ${Number(order.total).toFixed(2)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
