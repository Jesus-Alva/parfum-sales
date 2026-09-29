"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Trash2 } from "lucide-react";

const STATUSES = ["pending", "registered", "shipped", "delivered", "cancelled"];

export default function SaleDetail({ sale }: { sale: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(sale.status);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      await api.patch(`/sales/${sale.id}/status`, { status: newStatus });
      setStatus(newStatus);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la venta ${sale.folio}?`)) return;
    try {
      await api.delete(`/sales/${sale.id}`);
      router.push("/sales");
    } catch (e: any) {
      alert(e?.response?.data?.detail || "No se pudo eliminar");
    }
  };

  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-scentia-gold mb-1">Folio</p>
      <h1 className="font-mono text-2xl text-gradient-gold mb-6">{sale.folio}</h1>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        {/* ... Info de la venta ... */}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <label className="text-sm text-scentia-muted">Estado:</label>
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={saving}
          className="bg-scentia-card border border-scentia-border rounded-lg px-3 py-1.5 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <h3 className="font-display text-lg mb-2">Dirección</h3>
      <p className="text-scentia-muted text-sm mb-6">
        {sale.address.street} {sale.address.number}, {sale.address.city},{" "}
        {sale.address.state} {sale.address.postal_code}, {sale.address.country}
      </p>

      <button
        onClick={handleDelete}
        className="flex items-center gap-2 text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg transition"
      >
        <Trash2 size={16} /> Eliminar venta
      </button>
    </div>
  );
}