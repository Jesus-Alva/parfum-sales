"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import LocationMap from "@/components/shared/LocationMap";
import InteractiveMap from "@/components/shared/InteractiveMap";
import { geocodeWithPhoton } from "@/lib/geocoding";

export default function CheckoutModal({
  perfume,
  onClose,
}: {
  perfume: any;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_phone: "",
    quantity: 1,
    address: {
      street: "",
      number: "",
      city: "",
      state: "",
      postal_code: "",
      country: "México",
      references: "",
      latitude: null as number | null,
      longitude: null as number | null,
    },
  });
  const [locations, setLocations] = useState<any[]>([]);
  const [businessAddress, setBusinessAddress] = useState({ city: "", state: "" });
  const [businessCoordinates, setBusinessCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapStatus, setMapStatus] = useState("");
  const addressLookupRef = useRef<AbortController | null>(null);
  const [preferredLocationId, setPreferredLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get("/delivery-locations/"), api.get("/delivery-locations/settings")])
      .then(async ([locationResponse, settingsResponse]) => {
        if (cancelled) return;
        setLocations(locationResponse.data);
        const city = settingsResponse.data.business_city || "";
        const state = settingsResponse.data.business_state || "";
        setBusinessAddress({ city, state });
        if (!city) {
          setMapStatus("Configura BUSINESS_CITY para centrar el mapa en la sede.");
          return;
        }
        try {
          const center = await geocodeWithPhoton([city, state, "México"].filter(Boolean).join(", "));
          if (cancelled) return;
          if (center) {
            setBusinessCoordinates(center);
            setForm((prev) => prev.address.latitude == null ? { ...prev, address: { ...prev.address, ...center } } : prev);
            setMapStatus("Mapa centrado en el municipio de la sede.");
          } else setMapStatus("No encontramos el municipio de la sede; ajusta el pin en el mapa.");
        } catch {
          if (!cancelled) setMapStatus("No pudimos centrar el mapa; ajusta el pin manualmente.");
        }
      })
      .catch(() => { if (!cancelled) setMapStatus("No se pudieron cargar los puntos de entrega."); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const { street, number, city, state, postal_code, country } = form.address;
    if (!businessCoordinates || city.trim().length < 2) return;
    const query = [street, number, postal_code, city, state, country].filter(Boolean).join(", ");
    const controller = new AbortController();
    addressLookupRef.current = controller;
    setMapStatus("Ajustando el pin a la dirección…");
    const timer = window.setTimeout(() => {
      geocodeWithPhoton(query, businessCoordinates, controller.signal)
        .then((point) => {
          if (controller.signal.aborted) return;
          if (point) {
            setForm((prev) => ({ ...prev, address: { ...prev.address, ...point } }));
            setMapStatus("Ubicación aproximada por dirección. Arrastra el pin para corregirla si hace falta.");
          } else setMapStatus("No encontramos esa dirección; puedes colocar el pin en el mapa.");
        })
        .catch((e) => { if (e?.name !== "AbortError" && !controller.signal.aborted) setMapStatus("No pudimos ajustar el pin. Puedes colocarlo en el mapa."); });
    }, 900);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [form.address.street, form.address.number, form.address.city, form.address.state, form.address.postal_code, businessCoordinates]);

  const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
  const isLocal = useMemo(() => Boolean(businessAddress.city) && normalized(form.address.city) === normalized(businessAddress.city) && (!businessAddress.state || normalized(form.address.state) === normalized(businessAddress.state)), [businessAddress, form.address.city, form.address.state]);

  const updateAddress = (k: string, v: string) =>
    setForm({ ...form, address: { ...form.address, [k]: v } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/sales/", {
        perfume_id: perfume.id,
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
        quantity: Number(form.quantity),
        address: form.address,
        preferred_delivery_location_id: isLocal ? Number(preferredLocationId) : null,
      });
      setSuccess(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "No se pudo registrar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full bg-scentia-card border border-scentia-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-scentia-gold";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-scentia-muted hover:text-scentia-gold"
          >
            <X size={20} />
          </button>

          {success ? (
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-scentia-gold to-scentia-gold-soft flex items-center justify-center mb-5"
              >
                <span className="text-3xl text-black">✓</span>
              </motion.div>
              <h2 className="font-display text-2xl mb-2 text-gradient-gold">
                ¡Pedido recibido!
              </h2>
              <p className="text-scentia-muted text-sm mb-4">
                {success.delivery_type === "local" ? "Notificamos al equipo. Te confirmaremos por Telegram el lugar y horario de entrega." : "Notificamos al equipo para preparar el envío por paquetería."}
              </p>
              <div className="bg-scentia-card border border-scentia-border rounded-xl p-4 text-left">
                <p className="text-xs text-scentia-muted">Folio</p>
                <p className="font-mono text-scentia-gold text-lg mb-2">{success.folio}</p>
                <p className="text-xs text-scentia-muted">Total</p>
                <p className="text-lg">${success.total.toFixed(2)}</p>
              </div>
              <button
                onClick={onClose}
                className="mt-6 bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold px-6 py-2.5 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="font-display text-2xl mb-1 text-gradient-gold">
                Finalizar compra
              </h2>
              <p className="text-scentia-muted text-sm mb-5">
                {perfume.name} · ${perfume.price.toFixed(2)}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <input
                  className={input}
                  placeholder="Nombre del comprador"
                  value={form.buyer_name}
                  onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                  required
                />
                <input
                  className={input}
                  placeholder="Teléfono"
                  value={form.buyer_phone}
                  onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min={1}
                  max={perfume.stock}
                  className={input}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />

                <div className="border-t border-scentia-border pt-3">
                  <p className="text-xs uppercase tracking-widest text-scentia-gold mb-2">
                    Dirección del comprador
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className={`${input} col-span-2`}
                      placeholder="Calle"
                      value={form.address.street}
                      onChange={(e) => updateAddress("street", e.target.value)}
                      required
                    />
                    <input
                      className={input}
                      placeholder="Número"
                      value={form.address.number}
                      onChange={(e) => updateAddress("number", e.target.value)}
                    />
                    <input
                      className={input}
                      placeholder="Código postal"
                      value={form.address.postal_code}
                      onChange={(e) => updateAddress("postal_code", e.target.value)}
                    />
                    <input
                      className={input}
                      placeholder="Ciudad"
                      value={form.address.city}
                      onChange={(e) => updateAddress("city", e.target.value)}
                      required
                    />
                    <input
                      className={input}
                      placeholder="Estado"
                      value={form.address.state}
                      onChange={(e) => updateAddress("state", e.target.value)}
                      required={Boolean(businessAddress.state)}
                    />
                    <input
                      className={`${input} col-span-2`}
                      placeholder="Referencias"
                      value={form.address.references}
                      onChange={(e) => updateAddress("references", e.target.value)}
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-scentia-muted">El pin parte del municipio de la sede y se aproxima conforme completas la dirección. Puedes arrastrarlo o tocar el mapa para corregirlo.</p>
                    <InteractiveMap
                      latitude={form.address.latitude}
                      longitude={form.address.longitude}
                      initialCenter={businessCoordinates || undefined}
                      label="Dirección del comprador"
                      onChange={(latitude, longitude) => {
                        addressLookupRef.current?.abort();
                        setForm((prev) => ({ ...prev, address: { ...prev.address, latitude, longitude } }));
                        setMapStatus("Ubicación ajustada en el mapa.");
                      }}
                    />
                    {mapStatus && <p aria-live="polite" className="text-xs text-scentia-muted">{mapStatus}</p>}
                    <p className="text-[11px] text-scentia-muted">El texto de la dirección se usa para ubicar el pin con Photon, un geocodificador de datos OpenStreetMap. <a href="https://github.com/komoot/photon" target="_blank" rel="noreferrer" className="text-scentia-gold hover:underline">Ver Photon</a>.</p>
                  </div>
                </div>

                {isLocal && (
                  <div className="border-t border-scentia-border pt-3">
                    <p className="text-xs uppercase tracking-widest text-scentia-gold mb-1">Entrega dentro de {businessAddress.city}</p>
                    <p className="text-xs text-scentia-muted mb-3">Elige el punto que prefieres. El administrador confirmará el lugar y horario contigo por Telegram.</p>
                    {locations.length === 0 ? <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100">Aún no hay puntos de entrega disponibles. Contáctanos para coordinar tu pedido.</p> : <div className="space-y-3">{locations.map((location) => (
                      <label key={location.id} className={`block cursor-pointer rounded-xl border p-3 transition ${preferredLocationId === String(location.id) ? "border-scentia-gold/60 bg-scentia-gold/5" : "border-scentia-border"}`}>
                        <span className="flex items-start gap-2"><input type="radio" name="delivery-location" value={location.id} checked={preferredLocationId === String(location.id)} onChange={() => setPreferredLocationId(String(location.id))} className="mt-1 accent-[#d4af37]" /><span><strong className="text-sm">{location.name}</strong><span className="block text-xs text-scentia-muted">{location.address}, {location.city}</span>{location.notes && <span className="mt-1 block text-xs text-scentia-muted">{location.notes}</span>}</span></span>
                        {preferredLocationId === String(location.id) && <LocationMap latitude={location.latitude} longitude={location.longitude} label={location.name} className="mt-3" />}
                      </label>
                    ))}</div>}
                  </div>
                )}
              </div>

              <button
                disabled={loading || (isLocal && (!preferredLocationId || locations.length === 0))}
                className="w-full mt-5 bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Registrando..." : `Realizar pedido · $${(perfume.price * form.quantity).toFixed(2)}`}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
