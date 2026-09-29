"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, imageUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import ScrollReveal from "@/components/shared/ScrollReveal";
import CheckoutModal from "@/components/sales/CheckoutModal";
import { ShoppingBag, Heart } from "lucide-react";

export default function PerfumeShowcase() {
  const router = useRouter();
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthed(!!getToken());
    api
      .get("/perfumes/")
      .then((r) => setPerfumes(r.data.filter((p: any) => p.stock > 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = (perfume: any) => {
    if (!isAuthed) {
      router.push(`/login?next=/`);
      return;
    }
    setSelected(perfume);
  };

  return (
    <section id="showcase" className="py-24 px-6 relative">
      <ScrollReveal>
        <h2 className="font-display text-4xl md:text-5xl text-center mb-3">
          Colección <span className="text-gradient-gold">exclusiva</span>
        </h2>
        <p className="text-center text-scentia-muted mb-4">
          {isAuthed
            ? "Selecciona tu fragancia y realiza tu pedido."
            : "Regístrate para poder comprar. Mientras tanto, explora."}
        </p>
        {!isAuthed && (
          <p className="text-center mb-16">
            <a
              href="/register"
              className="text-scentia-gold underline hover:no-underline"
            >
              Crear cuenta →
            </a>
          </p>
        )}
      </ScrollReveal>

      {loading ? (
        <div className="text-center text-scentia-muted">Cargando perfumes...</div>
      ) : perfumes.length === 0 ? (
        <div className="text-center text-scentia-muted">
          No hay perfumes en stock por ahora.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {perfumes.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -8, rotateX: 3, rotateY: -3 }}
              style={{ transformStyle: "preserve-3d", perspective: 800 }}
              className="glass rounded-2xl p-6 relative group overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-radial-gold" />

              <div className="relative">
                <div className="aspect-square rounded-xl mb-5 overflow-hidden bg-gradient-to-br from-scentia-card to-scentia-bg flex items-center justify-center">
                  {p.image_url ? (
                    <img
                      src={imageUrl(p.image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <span className="font-display text-6xl text-scentia-gold/40">S</span>
                  )}
                </div>

                <p className="text-xs uppercase tracking-widest text-scentia-gold mb-1">
                  {p.brand}
                </p>
                <h3 className="font-display text-2xl mb-1">{p.name}</h3>
                <p className="text-sm text-scentia-muted mb-4 line-clamp-2">
                  {p.notes || p.family || p.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-semibold text-gradient-gold">
                      ${p.price.toFixed(2)}
                    </span>
                    <p className="text-xs text-scentia-muted mt-1">
                      {p.stock} disponibles
                    </p>
                  </div>
                  <button
                    onClick={() => handleBuy(p)}
                    className="bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
                  >
                    <ShoppingBag size={16} />
                    {isAuthed ? "Comprar" : "Regístrate"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <CheckoutModal perfume={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}