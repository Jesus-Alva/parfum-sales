"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { X } from "lucide-react";

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
    },
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");

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
      });
      setSuccess(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "No se pudo registrar la venta");
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
                ¡Venta registrada!
              </h2>
              <p className="text-scentia-muted text-sm mb-4">
                Notificamos al equipo por Telegram.
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
                    Dirección de envío
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
                    />
                    <input
                      className={`${input} col-span-2`}
                      placeholder="Referencias"
                      value={form.address.references}
                      onChange={(e) => updateAddress("references", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full mt-5 bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Registrando..." : `Confirmar compra · $${(perfume.price * form.quantity).toFixed(2)}`}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}