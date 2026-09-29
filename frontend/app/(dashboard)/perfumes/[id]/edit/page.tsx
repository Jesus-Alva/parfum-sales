"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import PerfumeForm from "@/components/perfumes/PerfumeForm";

export default function EditPerfumePage() {
  const { id } = useParams<{ id: string }>();
  const [perfume, setPerfume] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/perfumes/${id}`)
      .then((r) => setPerfume(r.data))
      .catch((e) => setError(e?.response?.data?.detail || "No encontrado"));
  }, [id]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!perfume) return <p className="text-scentia-muted">Cargando...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl text-gradient-gold mb-6">
        Editar: {perfume.name}
      </h1>
      <PerfumeForm perfume={perfume} />
    </div>
  );
}