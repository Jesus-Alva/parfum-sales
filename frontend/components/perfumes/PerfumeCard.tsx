"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { api, imageUrl } from "@/lib/api";

export default function PerfumeCard({
  perfume,
  onDelete,
}: {
  perfume: any;
  onDelete?: (id: number) => void;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${perfume.name}"?`)) return;
    try {
      await api.delete(`/perfumes/${perfume.id}`);
      onDelete?.(perfume.id);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "No se pudo eliminar");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="glass rounded-2xl p-5 overflow-hidden group relative"
    >
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
        <Link
          href={`/perfumes/${perfume.id}/edit`}
          className="bg-scentia-card/90 p-2 rounded-lg border border-scentia-border hover:border-scentia-gold"
          title="Editar"
        >
          <Pencil size={14} className="text-scentia-gold" />
        </Link>
        <button
          onClick={handleDelete}
          className="bg-scentia-card/90 p-2 rounded-lg border border-scentia-border hover:border-red-500"
          title="Eliminar"
        >
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>

      <div className="aspect-square rounded-xl mb-4 bg-gradient-to-br from-scentia-card to-scentia-bg flex items-center justify-center overflow-hidden">
        {perfume.image_url ? (
          <img src={imageUrl(perfume.image_url)} alt={perfume.name} />        ) : (
        <span className="font-display text-5xl text-scentia-gold/40">S</span>
        )}
      </div>
      <p className="text-xs uppercase tracking-widest text-scentia-gold">{perfume.brand}</p>
      <h3 className="font-display text-xl mb-1">{perfume.name}</h3>
      <p className="text-xs text-scentia-muted mb-3">
        {perfume.gender} · {perfume.volume_ml}ml · stock {perfume.stock}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gradient-gold">
          ${perfume.price.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}