"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SaleTable from "@/components/sales/SaleTable";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    api.get("/sales/").then((r) => setSales(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-gradient-gold mb-6">Historial de ventas</h1>
      <SaleTable sales={sales} />
    </div>
  );
}