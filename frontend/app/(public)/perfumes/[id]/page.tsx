"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import PerfumeDetailView from "@/components/landing/PerfumeDetailView";

export default function PublicPerfumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [perfume, setPerfume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/perfumes/${id}`)
      .then((r) => setPerfume(r.data))
      .catch((e) => {
        setError(e?.response?.data?.detail || "Perfume no encontrado");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-scentia-gold/30 border-t-scentia-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !perfume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-3xl text-gradient-gold">Perfume no encontrado</p>
        <p className="text-scentia-muted">{error}</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-radial-gold opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Breadcrumb / Botón atrás */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-scentia-muted hover:text-scentia-gold transition mb-8"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <PerfumeDetailView perfume={perfume} />
      </div>
    </div>
  );
}