"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, imageUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/store/cartStore";
import CheckoutModal from "@/components/sales/CheckoutModal";
import { ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";

export default function PerfumeShowcase() {
  const router = useRouter();
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [addedMessage, setAddedMessage] = useState("");
  const [quickBuyItem, setQuickBuyItem] = useState<CartItem | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.add);

  useEffect(() => {
    setIsAuthed(!!getToken());
    api
      .get("/perfumes/")
      .then((r) => setPerfumes(r.data.filter((p: any) => p.stock > 0).slice(0, 6)))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const syncAuth = () => setIsAuthed(!!getToken());
    window.addEventListener("scentia:auth-change", syncAuth);
    return () => window.removeEventListener("scentia:auth-change", syncAuth);
  }, []);

  const handleAddToCart = (e: React.MouseEvent, perfume: any) => {
    e.stopPropagation();   // 👈 evita que también navegue al detalle
    if (!getToken()) {
      setIsAuthed(false);
      router.push(`/login?next=/perfumes/${perfume.id}`);
      return;
    }
    addToCart({ perfumeId: perfume.id, name: perfume.name, brand: perfume.brand, imageUrl: perfume.image_url || "", price: perfume.price, stock: perfume.stock, quantity: 1 });
    setAddedMessage(`${perfume.name} se agregó al carrito.`);
    window.setTimeout(() => setAddedMessage(""), 2200);
  };

  const handleBuyNow = (e: React.MouseEvent, perfume: any) => {
    e.stopPropagation();
    if (!getToken()) {
      setIsAuthed(false);
      router.push(`/login?next=/perfumes/${perfume.id}`);
      return;
    }
    setQuickBuyItem({ perfumeId: perfume.id, name: perfume.name, brand: perfume.brand, imageUrl: perfume.image_url || "", price: perfume.price, stock: perfume.stock, quantity: 1 });
  };

  const goToDetail = (id: number) => {
    router.push(`/perfumes/${id}`);
  };

  return (
    <section id="showcase" className="py-24 px-6 relative">
      <ScrollReveal>
        <h2 className="font-display text-4xl md:text-5xl text-center mb-3">
          Fragancias <span className="text-gradient-gold">destacadas</span>
        </h2>
        <p className="text-center text-scentia-muted mb-4">
          {isAuthed
            ? "Selecciona tu fragancia y realiza tu pedido."
            : "Regístrate para poder comprar. Mientras tanto, explora."}
        </p>
        {!isAuthed && (
          <p className="text-center mb-16">
            <a href="/register" className="text-scentia-gold underline hover:no-underline">
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
              onClick={() => goToDetail(p.id)}   // 👈 toda la tarjeta navega
              className="glass rounded-2xl p-6 relative group overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-radial-gold pointer-events-none" />

              {/* Indicador "Ver detalle" al hover */}
              <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition">
                <span className="flex items-center gap-1.5 bg-scentia-card/90 backdrop-blur text-xs px-2.5 py-1.5 rounded-full border border-scentia-border">
                  <Eye size={12} className="text-scentia-gold" />
                  Ver
                </span>
              </div>

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

                  {/* Badge de múltiples imágenes */}
                  {p.images?.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-full z-10">
                      {p.images.length} 📷
                    </span>
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
                  <div className="flex gap-2 relative z-20">
                    <button type="button" onClick={(e) => handleBuyNow(e, p)} className="rounded-lg border border-scentia-gold/40 px-3 py-2 text-xs font-semibold text-scentia-gold hover:bg-scentia-gold/10 transition">Realizar pedido</button>
                    <button type="button" onClick={(e) => handleAddToCart(e, p)} className="bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2">
                      <ShoppingBag size={15} />{isAuthed ? "Agregar" : "Regístrate"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {perfumes.length > 0 && (
        <div className="text-center mt-12">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-scentia-gold/40 text-scentia-gold hover:bg-scentia-gold/10 transition"
          >
            Ver catálogo completo →
          </Link>
        </div>
      )}

      {addedMessage && <div role="status" className="fixed bottom-5 right-5 z-40 flex items-center gap-4 rounded-xl border border-scentia-gold/30 bg-scentia-card px-4 py-3 text-sm shadow-xl"><span>{addedMessage}</span><Link href="/carrito" className="shrink-0 text-scentia-gold hover:underline">Ver carrito</Link></div>}
      {quickBuyItem && <CheckoutModal items={[quickBuyItem]} onClose={() => setQuickBuyItem(null)} onComplete={() => undefined} />}
    </section>
  );
}
