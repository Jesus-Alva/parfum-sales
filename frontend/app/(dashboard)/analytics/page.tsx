"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SalesChart from "@/components/dashboard/SalesChart";
import CostChart from "@/components/dashboard/CostChart";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [costs, setCosts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/dashboard/costs").then((r) => setCosts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-gradient-gold">Analytics</h1>
      <SalesChart data={stats?.sales_by_day ?? []} />
      <CostChart data={costs} />
    </div>
  );
}