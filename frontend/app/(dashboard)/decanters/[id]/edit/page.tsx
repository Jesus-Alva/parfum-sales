"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import DecanterForm from "@/components/perfumes/DecanterForm";

export default function EditDecanterPage() {
  const { id } = useParams<{ id: string }>();
  const [decanter, setDecanter] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get(`/decanters/${id}`)
      .then((response) => setDecanter(response.data))
      .catch((e) => setError(e?.response?.data?.detail || "No se encontró el decanter."));
  }, [id]);

  if (error) return <p role="alert" className="text-red-400">{error}</p>;
  if (!decanter) return <p className="text-scentia-muted">Cargando...</p>;
  return <div>
    <h1 className="mb-6 font-display text-3xl text-gradient-gold">Editar decanter</h1>
    <DecanterForm decanter={decanter} />
  </div>;
}
