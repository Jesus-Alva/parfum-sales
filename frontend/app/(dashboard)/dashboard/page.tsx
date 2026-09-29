"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import CostChart from "@/components/dashboard/CostChart";
import { DollarSign, ShoppingBag, SprayCan, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [costs, setCosts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/dashboard/costs").then((r) => setCosts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-gradient-gold">Panel</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingBag />} label="Ventas totales" value={stats?.total_sales ?? "—"} />
        <StatCard icon={<DollarSign />} label="Ingresos" value={`$${(stats?.total_revenue ?? 0).toFixed(2)}`} />
        <StatCard icon={<SprayCan />} label="Perfumes" value={stats?.total_perfumes ?? "—"} />
        <StatCard icon={<AlertTriangle />} label="Stock bajo" value={stats?.low_stock ?? "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={stats?.sales_by_day ?? []} />
        <CostChart data={costs} />
      </div>
    </div>
  );
}