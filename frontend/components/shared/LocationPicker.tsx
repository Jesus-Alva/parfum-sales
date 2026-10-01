"use client";

import { useState } from "react";
import InteractiveMap from "@/components/shared/InteractiveMap";
import { geocodeWithPhoton } from "@/lib/geocoding";

type Props = { latitude: number | null; longitude: number | null; initialCenter?: { latitude: number; longitude: number }; label?: string; allowSearch?: boolean; onChange: (latitude: number, longitude: number) => void };

export default function LocationPicker({ latitude, longitude, initialCenter, label = "Ubicación", allowSearch = false, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const locate = async () => {
    if (!query.trim() || !allowSearch) return;
    setSearching(true);
    setError("");
    try {
      const point = await geocodeWithPhoton(query, initialCenter);
      if (!point) throw new Error("No se encontró esa dirección");
      onChange(point.latitude, point.longitude);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo encontrar la ubicación");
    } finally {
      setSearching(false);
    }
  };

  const input = "min-w-0 w-full rounded-lg border border-scentia-border bg-scentia-card px-3 py-2 text-sm text-scentia-text focus:border-scentia-gold focus:outline-none";
  return (
    <div className="space-y-3">
      {allowSearch && <div className="flex flex-col gap-2 sm:flex-row">
        <input className={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar calle, sitio o colonia" aria-label="Buscar ubicación" />
        <button type="button" onClick={locate} disabled={searching || !query.trim()} className="shrink-0 rounded-lg border border-scentia-gold/40 px-4 py-2 text-sm text-scentia-gold transition hover:bg-scentia-gold/10 disabled:opacity-50">{searching ? "Buscando…" : "Ubicar en mapa"}</button>
      </div>}
      {error && <p className="text-xs text-red-300">{error}</p>}
      <InteractiveMap latitude={latitude} longitude={longitude} initialCenter={initialCenter} label={label} onChange={onChange} />
      <p className="text-[11px] text-scentia-muted">© OpenStreetMap contributors. {allowSearch && "El buscador usa Photon con datos OpenStreetMap."}</p>
    </div>
  );
}
