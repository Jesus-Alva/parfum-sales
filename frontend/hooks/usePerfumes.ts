"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function usePerfumes() {
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/perfumes/")
      .then((r) => setPerfumes(r.data))
      .finally(() => setLoading(false));
  }, []);

  return { perfumes, loading, setPerfumes };
}