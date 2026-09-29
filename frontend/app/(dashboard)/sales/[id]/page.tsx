"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import SaleDetail from "@/components/sales/SaleDetail";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<any>(null);

  useEffect(() => {
    if (id) api.get(`/sales/${id}`).then((r) => setSale(r.data)).catch(() => {});
  }, [id]);

  if (!sale) return <p className="text-scentia-muted">Cargando...</p>;
  return <SaleDetail sale={sale} />;
}