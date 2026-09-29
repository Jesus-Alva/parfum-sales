"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/sales/")
      .then((r) => setSales(r.data))
      .finally(() => setLoading(false));
  }, []);

  return { sales, loading, setSales };
}