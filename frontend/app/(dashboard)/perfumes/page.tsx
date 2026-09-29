"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import PerfumeCard from "@/components/perfumes/PerfumeCard";

export default function PerfumesPage() {
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/perfumes/")
      .then((r) => setPerfumes(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    setPerfumes((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-gradient-gold">Perfumes</h1>
        <Link
          href="/perfumes/new"
          className="bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black px-4 py-2 rounded-lg font-semibold"
        >
          + Nuevo
        </Link>
      </div>

      {loading ? (
        <p className="text-scentia-muted">Cargando...</p>
      ) : perfumes.length === 0 ? (
        <p className="text-scentia-muted">Sin perfumes registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {perfumes.map((p) => (
            <PerfumeCard key={p.id} perfume={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}