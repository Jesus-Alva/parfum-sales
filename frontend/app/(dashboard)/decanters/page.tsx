"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { api, imageUrl } from "@/lib/api";

export default function DecantersPage() {
  const [decanters, setDecanters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/decanters/")
      .then((response) => { if (active) setDecanters(response.data); })
      .catch((e) => { if (active) setError(e?.response?.data?.detail || "No se pudieron cargar los decanters."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const toggle = async (id: number) => {
    setError("");
    try {
      const { data } = await api.patch(`/decanters/${id}/status`);
      setDecanters((current) => current.map((item) => item.id === id ? data : item));
    } catch (e: any) {
      setError(e?.response?.data?.detail || "No se pudo cambiar el estado.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gradient-gold">Decanters</h1>
          <p className="mt-1 text-sm text-scentia-muted">Registra frascos pequeños vinculados a un perfume base.</p>
        </div>
        <Link href="/decanters/new" className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-4 py-2 font-semibold text-black"><Plus size={17} /> Nuevo decanter</Link>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}
      {loading ? <p className="text-scentia-muted">Cargando...</p> : decanters.length === 0 ? <p className="text-scentia-muted">Aún no hay decanters registrados.</p> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {decanters.map((item) => <article key={item.id} className="glass flex gap-4 rounded-2xl p-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-scentia-card">
              {item.image_url || item.perfume_image_url ? <Image src={imageUrl(item.image_url || item.perfume_image_url)} alt={`Decanter de ${item.perfume_name}`} width={96} height={96} unoptimized className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-display text-3xl text-scentia-gold/50">S</div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-scentia-gold">{item.brand}</p>
              <h2 className="truncate font-display text-xl">{item.perfume_name}</h2>
              <p className="mt-1 text-sm text-scentia-muted">Decanter · {item.volume_ml} ml · Stock: {item.stock}</p>
              <p className="mt-1 font-semibold text-scentia-gold">${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-between">
              <span className={`rounded-full px-2 py-1 text-xs ${item.is_enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-scentia-muted"}`}>{item.is_enabled ? "Activo" : "Desactivado"}</span>
              <div className="flex gap-2">
                <Link aria-label="Editar decanter" href={`/decanters/${item.id}/edit`} className="rounded-lg border border-scentia-border p-2 text-scentia-gold hover:border-scentia-gold"><Pencil size={15} /></Link>
                <button type="button" aria-label={item.is_enabled ? "Desactivar decanter" : "Activar decanter"} onClick={() => toggle(item.id)} className="rounded-lg border border-scentia-border p-2 text-scentia-gold hover:border-scentia-gold">{item.is_enabled ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}</button>
              </div>
            </div>
          </article>)}
        </div>
      )}
    </div>
  );
}
