"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import InteractiveMap from "@/components/shared/InteractiveMap";
import DeliveryLocationsMap from "@/components/shared/DeliveryLocationsMap";
import type { CartItem } from "@/store/cartStore";

const BUSINESS_MAP_CENTER = { latitude: 19.6681961, longitude: -99.0188746};

export default function CheckoutModal({
  items,
  onClose,
  onComplete,
}: {
  items: CartItem[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_phone: "",
    address: {
      street: "",
      number: "",
      city: "",
      state: "",
      postal_code: "",
      country: "México",
      references: "",
      latitude: BUSINESS_MAP_CENTER.latitude as number | null,
      longitude: BUSINESS_MAP_CENTER.longitude as number | null,
    },
  });
  const [locations, setLocations] = useState<any[]>([]);
  const [businessAddress, setBusinessAddress] = useState({ city: "", state: "" });
  const [businessCoordinates, setBusinessCoordinates] = useState<{ latitude: number; longitude: number } | null>(BUSINESS_MAP_CENTER);
  const [preferredLocationId, setPreferredLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    let cancelled = false;
    if (getToken()) {
      api.get("/users/me")
        .then(({ data }) => {
          if (cancelled || !data.full_name) return;
          setForm((prev) => prev.buyer_name.trim() ? prev : { ...prev, buyer_name: data.full_name });
        })
        .catch(() => undefined);
    }
    Promise.all([api.get("/delivery-locations/"), api.get("/delivery-locations/settings")])
      .then(([locationResponse, settingsResponse]) => {
        if (cancelled) return;
        setLocations(locationResponse.data);
        const city = settingsResponse.data.business_city || "";
        const state = settingsResponse.data.business_state || "";
        setBusinessAddress({ city, state });
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            city: prev.address.city || city,
            state: prev.address.state || state,
            ...BUSINESS_MAP_CENTER,
          },
        }));
      })
      .catch(() => { if (!cancelled) setLocations([]); });
    return () => { cancelled = true; };
  }, []);

  const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
  const isLocal = useMemo(
    () => Boolean(businessAddress.city)
      && normalized(form.address.city) === normalized(businessAddress.city)
      && (!businessAddress.state || normalized(form.address.state) === normalized(businessAddress.state)),
    [businessAddress.city, businessAddress.state, form.address.city, form.address.state],
  );

  const updateAddress = (k: string, v: string) =>
    setForm({ ...form, address: { ...form.address, [k]: v } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/sales/", {
        items: items.map((item) => ({ perfume_id: item.perfumeId, quantity: item.quantity })),
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
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
            onClick={() => { if (success) onComplete(); onClose(); }}
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
                onClick={() => { onComplete(); onClose(); }}
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
                {items.length} producto{items.length === 1 ? "" : "s"} · ${total.toFixed(2)}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="rounded-xl border border-scentia-border bg-scentia-card/50 p-3">
                  <p className="mb-2 text-xs uppercase tracking-widest text-scentia-gold">Tu pedido</p>
                  {items.map((item) => (
                    <div key={item.perfumeId} className="flex justify-between gap-3 py-1 text-sm">
                      <span className="text-scentia-muted">{item.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-scentia-border pt-2 font-semibold">
                    <span>Total</span><span className="text-scentia-gold">${total.toFixed(2)}</span>
                  </div>
                </div>
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
                  {!isLocal && <div className="mt-3 space-y-2">
                    <p className="text-xs text-scentia-muted">Para envíos por paquetería, puedes señalar el domicilio en el mapa.</p>
                    <InteractiveMap
                      latitude={form.address.latitude}
                      longitude={form.address.longitude}
                      initialCenter={businessCoordinates || undefined}
                      label="Dirección del comprador"
                      onChange={(latitude, longitude) => setForm((prev) => ({ ...prev, address: { ...prev.address, latitude, longitude } }))}
                    />
                  </div>}
                </div>

                {isLocal && (
                  <div className="border-t border-scentia-border pt-3">
                    <p className="text-xs uppercase tracking-widest text-scentia-gold mb-1">Entrega dentro de {businessAddress.city}</p>
                    <p className="text-xs text-scentia-muted mb-3">Elige el punto que prefieres. El administrador confirmará el lugar y horario contigo por Telegram.</p>
                    {locations.length === 0 ? <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100">Aún no hay puntos de entrega disponibles. Contáctanos para coordinar tu pedido.</p> : <div className="space-y-3">
                      <DeliveryLocationsMap locations={locations} selectedLocationId={preferredLocationId} initialCenter={businessCoordinates || BUSINESS_MAP_CENTER} onSelect={setPreferredLocationId} />
                      {locations.map((location) => (
                      <label key={location.id} className={`block cursor-pointer rounded-xl border p-3 transition ${preferredLocationId === String(location.id) ? "border-scentia-gold/60 bg-scentia-gold/5" : "border-scentia-border"}`}>
                        <span className="flex items-start gap-2"><input type="radio" name="delivery-location" value={location.id} checked={preferredLocationId === String(location.id)} onChange={() => setPreferredLocationId(String(location.id))} className="mt-1 accent-[#d4af37]" /><span><strong className="text-sm">{location.name}</strong><span className="block text-xs text-scentia-muted">{location.address}, {location.city}</span>{location.notes && <span className="mt-1 block text-xs text-scentia-muted">{location.notes}</span>}</span></span>
                      </label>
                    ))}</div>}
                  </div>
                )}
              </div>

              <button
                disabled={loading || (isLocal && (!preferredLocationId || locations.length === 0))}
                className="w-full mt-5 bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Registrando..." : `Realizar pedido · $${total.toFixed(2)}`}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
