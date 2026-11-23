"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import DeliveryLocationsMap from "@/components/shared/DeliveryLocationsMap";
import type { CartItem } from "@/store/cartStore";

const BUSINESS_MAP_CENTER = { latitude: 19.6681961, longitude: -99.0188746};
const DELIVERY_DAY_LABELS: Record<string, string> = { monday: "lunes", tuesday: "martes", wednesday: "miércoles", thursday: "jueves", friday: "viernes", saturday: "sábado", sunday: "domingo" };

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
      latitude: null as number | null,
      longitude: null as number | null,
    },
  });
  const [locations, setLocations] = useState<any[]>([]);
  const [preferredLocationId, setPreferredLocationId] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    let cancelled = false;
    if (getToken()) {
      api.get("/users/me")
        .then(({ data }) => {
          if (cancelled) return;
          setForm((prev) => ({
            ...prev,
            buyer_name: prev.buyer_name.trim() ? prev.buyer_name : data.full_name || prev.buyer_name,
            buyer_phone: prev.buyer_phone.trim() ? prev.buyer_phone : data.phone || prev.buyer_phone,
            ...(data.address ? { address: { ...data.address } } : {}),
          }));
          setAddressSaved(Boolean(data.address));
        })
        .catch(() => undefined);
    }
    api.get("/delivery-locations/")
      .then((locationResponse) => {
        if (cancelled) return;
        setLocations(locationResponse.data);
      })
      .catch(() => { if (!cancelled) setLocations([]); });
    return () => { cancelled = true; };
  }, []);

  const updateAddress = (k: string, v: string) =>
    setForm({ ...form, address: { ...form.address, [k]: v } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (getToken() && !addressSaved) {
        await api.put("/users/me/address", form.address);
        setAddressSaved(true);
      }
      const { data } = await api.post("/sales/", {
        items: items.map((item) => ({ perfume_id: item.perfumeId, quantity: item.quantity })),
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
        address: form.address,
        preferred_delivery_location_id: Number(preferredLocationId),
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
                {success.delivery_type === "local" ? "Notificamos al equipo para preparar tu entrega en el punto seleccionado y su horario habitual." : "Notificamos al equipo para preparar la entrega del pedido."}
              </p>
              <div className="bg-scentia-card border border-scentia-border rounded-xl p-4 text-left">
                <p className="text-xs text-scentia-muted">Folio</p>
                <p className="font-mono text-scentia-gold text-lg mb-2">{success.folio}</p>
                <p className="text-xs text-scentia-muted">Total</p>
                <p className="text-lg">${success.total.toFixed(2)}</p>
                {success.delivery_type === "local" && success.preferred_delivery_location && <div className="mt-3 border-t border-scentia-border pt-3"><p className="text-xs text-scentia-muted">Punto y horario habitual</p><p className="mt-1 text-sm">{success.preferred_delivery_location.name}</p><p className="text-xs text-scentia-gold">{DELIVERY_DAY_LABELS[success.preferred_delivery_location.delivery_day] || success.preferred_delivery_location.delivery_day} · {success.preferred_delivery_location.delivery_start_time?.slice(0, 5)}–{success.preferred_delivery_location.delivery_end_time?.slice(0, 5)}</p></div>}
              </div>
              <div className="mt-5 flex flex-col items-center">
                <div className="rounded-xl bg-white p-3">
                  <QRCodeSVG value={success.folio} size={176} level="M" includeMargin />
                </div>
                <p className="mt-3 max-w-xs text-xs text-scentia-muted">El administrador puede escanear este código en Pedidos para consultar los productos.</p>
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
                Realizar pedido
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
                  {addressSaved ? (
                    <div className="rounded-lg border border-scentia-border bg-scentia-card/50 p-3 text-sm">
                      <p className="font-medium">Dirección registrada</p>
                      <p className="mt-1 text-xs text-scentia-muted">
                        {form.address.street} {form.address.number}, {form.address.city}, {form.address.state} {form.address.postal_code}
                      </p>
                      <p className="mt-2 text-xs text-scentia-muted">La entrega de este pedido se realizará en el punto que selecciones; no hacemos envíos a domicilio ni por paquetería.</p>
                    </div>
                  ) : <>
                  <p className="mb-3 text-xs leading-relaxed text-scentia-muted">
                    Guardamos estos datos como referencia de contacto. La entrega se realiza en un punto establecido que debes seleccionar; no hacemos envíos a domicilio ni por paquetería.
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
                      required
                    />
                    <input
                      className={`${input} col-span-2`}
                      placeholder="Referencias"
                      value={form.address.references}
                      onChange={(e) => updateAddress("references", e.target.value)}
                    />
                  </div>
                  </>}
                </div>

                <div className="border-t border-scentia-border pt-3">
                    <p className="text-xs uppercase tracking-widest text-scentia-gold mb-1">Punto de entrega</p>
                    <p className="text-xs text-scentia-muted mb-3">Selecciona un punto disponible en Tecámac y alrededores. Cada lugar muestra su día y rango horario habitual.</p>
                    {locations.length === 0 ? <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100">Aún no hay puntos de entrega disponibles, por lo que no es posible registrar el pedido en este momento.</p> : <div className="space-y-3">
                      <DeliveryLocationsMap locations={locations} selectedLocationId={preferredLocationId} initialCenter={BUSINESS_MAP_CENTER} onSelect={setPreferredLocationId} />
                      {locations.map((location) => (
                      <label key={location.id} className={`block cursor-pointer rounded-xl border p-3 transition ${preferredLocationId === String(location.id) ? "border-scentia-gold/60 bg-scentia-gold/5" : "border-scentia-border"}`}>
                        <span className="flex items-start gap-2"><input type="radio" name="delivery-location" value={location.id} checked={preferredLocationId === String(location.id)} onChange={() => setPreferredLocationId(String(location.id))} className="mt-1 accent-[#d4af37]" /><span><strong className="text-sm">{location.name}</strong><span className="block text-xs text-scentia-muted">{location.address}, {location.city}</span><span className="mt-1 block text-xs text-scentia-gold">{location.delivery_day ? `Entrega los ${DELIVERY_DAY_LABELS[location.delivery_day] || location.delivery_day}, ${location.delivery_start_time?.slice(0, 5)}–${location.delivery_end_time?.slice(0, 5)}` : "Horario pendiente de confirmar"}</span>{location.notes && <span className="mt-1 block text-xs text-scentia-muted">{location.notes}</span>}</span></span>
                      </label>
                    ))}</div>}
                </div>
              </div>

              <button
                disabled={loading || !preferredLocationId || locations.length === 0}
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
