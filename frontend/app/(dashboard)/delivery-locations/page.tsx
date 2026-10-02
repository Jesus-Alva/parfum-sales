"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import LocationPicker from "@/components/shared/LocationPicker";
import LocationMap from "@/components/shared/LocationMap";

type Location = { id: number; name: string; address: string; city: string; state: string; latitude: number; longitude: number; notes: string; is_active: boolean };
const INITIAL_DELIVERY_POINT = { latitude: 19.6681961, longitude: -99.0188746 };
const blank = { name: "", address: "", city: "", state: "", ...INITIAL_DELIVERY_POINT, notes: "", is_active: true };

export default function DeliveryLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState(blank);
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessCoordinates] = useState<{ latitude: number; longitude: number }>(INITIAL_DELIVERY_POINT);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [{ data: locationsData }, { data: settings }] = await Promise.all([api.get("/delivery-locations/admin"), api.get("/delivery-locations/settings")]);
    setLocations(locationsData);
    setBusinessCity(settings.business_city || "");
    setBusinessState(settings.business_state || "");
    if (settings.business_city) setForm((current) => ({ ...current, city: current.city || settings.business_city, state: current.state || settings.business_state || "" }));
  };

  useEffect(() => { load().catch(() => setError("No se pudieron cargar las ubicaciones")); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    if (form.latitude == null || form.longitude == null) { setError("Ubica el punto en el mapa antes de guardar."); return; }
    setLoading(true);
    try {
      await api.post("/delivery-locations/", form);
      setForm({ ...blank, city: businessCity, state: businessState });
      setMessage("Ubicación agregada. Ya está disponible para los pedidos locales.");
      await load();
    } catch (e: any) { setError(e?.response?.data?.detail || "No se pudo guardar la ubicación"); }
    finally { setLoading(false); }
  };

  const toggle = async (location: Location) => {
    try { await api.patch(`/delivery-locations/${location.id}`, { is_active: !location.is_active }); await load(); }
    catch (e: any) { setError(e?.response?.data?.detail || "No se pudo actualizar la ubicación"); }
  };

  const input = "w-full rounded-lg border border-scentia-border bg-scentia-card px-3 py-2 text-sm text-scentia-text focus:border-scentia-gold focus:outline-none";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div><p className="text-xs uppercase tracking-[0.25em] text-scentia-muted">Puntos de encuentro</p><h1 className="font-display text-3xl text-gradient-gold">Ubicaciones de entrega</h1><p className="mt-2 text-sm text-scentia-muted">Administra los lugares disponibles para compradores de {businessCity || "tu municipio"}{businessState ? `, ${businessState}` : ""}.</p></div>
      {(error || message) && <p className={`rounded-lg border p-3 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"}`}>{error || message}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-xl text-scentia-gold">Agregar ubicación</h2>
          <label className="block text-sm text-scentia-muted">Nombre del punto<input className={`${input} mt-1`} required maxLength={150} placeholder="Ej. Plaza principal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="block text-sm text-scentia-muted">Dirección<input className={`${input} mt-1`} required maxLength={500} placeholder="Calle, número, colonia" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-sm text-scentia-muted">Municipio<input className={`${input} mt-1`} required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label><label className="text-sm text-scentia-muted">Estado<input className={`${input} mt-1`} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label></div>
          <label className="block text-sm text-scentia-muted">Indicaciones<textarea className={`${input} mt-1`} rows={2} placeholder="Referencia para encontrar el punto" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="border-t border-scentia-border pt-4"><p className="mb-3 text-sm text-scentia-muted">Busca la dirección pública o toca el mapa para fijar el punto de entrega.</p><LocationPicker latitude={form.latitude} longitude={form.longitude} initialCenter={businessCoordinates} label={form.name || "Punto de entrega"} allowSearch onChange={(latitude, longitude) => setForm({ ...form, latitude, longitude })} /></div>
          <button disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-4 py-2.5 font-semibold text-black transition hover:opacity-90 disabled:opacity-50">{loading ? "Guardando…" : "Guardar ubicación"}</button>
        </form>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-scentia-gold">Lugares registrados <span className="text-sm text-scentia-muted">({locations.length})</span></h2>
          {locations.length === 0 ? <div className="glass rounded-2xl p-8 text-center text-sm text-scentia-muted">Todavía no hay ubicaciones. Agrega una para que los compradores locales puedan elegirla.</div> : locations.map((location) => (
            <article key={location.id} className="glass space-y-3 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{location.name}</h3><p className="mt-1 text-sm text-scentia-muted">{location.address}, {location.city}{location.state ? `, ${location.state}` : ""}</p>{location.notes && <p className="mt-1 text-xs text-scentia-muted">{location.notes}</p>}</div><button onClick={() => toggle(location)} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${location.is_active ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-scentia-border text-scentia-muted"}`}>{location.is_active ? "Activa" : "Inactiva"}</button></div>
              <LocationMap latitude={location.latitude} longitude={location.longitude} label={location.name} />
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
