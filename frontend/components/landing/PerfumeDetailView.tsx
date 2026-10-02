"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Star,
  Droplets,
  Sparkles,
  Tag,
  Package,
  User as UserIcon,
} from "lucide-react";
import { imageUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import ImageGallery from "@/components/perfumes/ImageGallery";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/store/cartStore";
import CheckoutModal from "@/components/sales/CheckoutModal";

export default function PerfumeDetailView({ perfume }: { perfume: any }) {
  const router = useRouter();
  const [addedToCart, setAddedToCart] = useState(false);
  const [quickBuyItem, setQuickBuyItem] = useState<CartItem | null>(null);
  const addToCart = useCartStore((state) => state.add);

  // Galería: si tiene imágenes múltiples, usa perfume.images;
  // si no, cae al cover (image_url) como única imagen
  const images =
    perfume.images && perfume.images.length > 0
      ? perfume.images
      : perfume.image_url
        ? [{ id: 0, url: perfume.image_url, position: 0 }]
        : [];

  const handleAddToCart = () => {
    if (!getToken()) {
      router.push(`/login?next=/perfumes/${perfume.id}`);
      return;
    }
    addToCart({ perfumeId: perfume.id, name: perfume.name, brand: perfume.brand, imageUrl: perfume.image_url || "", price: perfume.price, stock: perfume.stock, quantity: 1 });
    setAddedToCart(true);
  };

  const handleBuyNow = () => {
    if (!getToken()) {
      router.push(`/login?next=/perfumes/${perfume.id}`);
      return;
    }
    setQuickBuyItem({ perfumeId: perfume.id, name: perfume.name, brand: perfume.brand, imageUrl: perfume.image_url || "", price: perfume.price, stock: perfume.stock, quantity: 1 });
  };

  const inStock = perfume.stock > 0;

  // Animaciones reutilizables
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
        {/* ─── GALERÍA ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="sticky top-24">
            <ImageGallery images={images} name={perfume.name} />

            {/* Badge de disponibilidad */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${inStock
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-green-400" : "bg-red-400"
                    }`}
                />
                {inStock ? `${perfume.stock} disponibles` : "Agotado"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── INFORMACIÓN ─────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.15 },
            },
          }}
          className="space-y-6"
        >
          {/* Marca + Título */}
          <motion.div variants={fadeUp}>
            <p className="text-xs uppercase tracking-[0.3em] text-scentia-gold mb-3 flex items-center gap-2">
              <Sparkles size={12} />
              {perfume.brand}
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mb-2">
              {perfume.name}
            </h1>

            {/* Género */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs uppercase tracking-wider text-scentia-muted border border-scentia-border px-3 py-1 rounded-full">
                {perfume.gender === "masculine"
                  ? "Masculino"
                  : perfume.gender === "feminine"
                    ? "Femenino"
                    : "Unisex"}
              </span>
              {perfume.family && (
                <span className="text-xs uppercase tracking-wider text-scentia-muted border border-scentia-border px-3 py-1 rounded-full">
                  {perfume.family}
                </span>
              )}
            </div>
          </motion.div>

          {/* Precio */}
          <motion.div variants={fadeUp} className="flex items-baseline gap-3">
            <span className="font-display text-4xl text-gradient-gold">
              ${perfume.price.toFixed(2)}
            </span>
            <span className="text-sm text-scentia-muted">
              {perfume.volume_ml} ml
            </span>
          </motion.div>

          {/* Separador con brillo */}
          <motion.div
            variants={fadeUp}
            className="h-px bg-gradient-to-r from-transparent via-scentia-gold/40 to-transparent"
          />

          {/* Descripción */}
          {perfume.description && (
            <motion.div variants={fadeUp}>
              <h3 className="text-xs uppercase tracking-widest text-scentia-gold mb-2">
                Descripción
              </h3>
              <p className="text-scentia-text/90 leading-relaxed whitespace-pre-line">
                {perfume.description}
              </p>
            </motion.div>
          )}

          {/* ─── Características ─────────────────────── */}
          {(perfume.tipo || perfume.estilo || perfume.perfil || perfume.uso || perfume.presentacion) && (
            <motion.div variants={fadeUp}>
              <h3 className="text-xs uppercase tracking-widest text-scentia-gold mb-3">
                Características
              </h3>
              <div className="space-y-3">
                {perfume.tipo && (
                  <CharRow label="Tipo" value={perfume.tipo} />
                )}
                {perfume.perfil && (
                  <CharRow label="Perfil aromático" value={perfume.perfil} />
                )}
                {perfume.estilo && (
                  <CharRow label="Estilo" value={perfume.estilo} />
                )}
                {perfume.uso && (
                  <CharRow label="Uso recomendado" value={perfume.uso} />
                )}
                {perfume.presentacion && (
                  <CharRow label="Presentación" value={perfume.presentacion} />
                )}
              </div>
            </motion.div>
          )}

          {/* Notas olfativas */}
          {perfume.notes && (
            <motion.div variants={fadeUp}>
              <h3 className="text-xs uppercase tracking-widest text-scentia-gold mb-2 flex items-center gap-2">
                <Droplets size={12} />
                Notas olfativas
              </h3>
              <p className="text-scentia-text/90 leading-relaxed">
                {perfume.notes}
              </p>
            </motion.div>
          )}

          {/* ─── FICHA TÉCNICA ─────────────────────── */}
          <motion.div variants={fadeUp}>
            <h3 className="text-xs uppercase tracking-widest text-scentia-gold mb-3 flex items-center gap-2">
              <Tag size={12} />
              Ficha técnica
            </h3>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <TechRow label="Producto" value={perfume.name} />
                  <TechRow label="Marca" value={perfume.brand} />
                  {perfume.tipo && <TechRow label="Tipo" value={perfume.tipo} />}
                  <TechRow
                    label="Género"
                    value={
                      perfume.gender === "masculine"
                        ? "Masculino"
                        : perfume.gender === "feminine"
                          ? "Femenino"
                          : "Unisex"
                    }
                  />
                  {perfume.family && <TechRow label="Familia olfativa" value={perfume.family} />}
                  {perfume.perfil && <TechRow label="Perfil aromático" value={perfume.perfil} />}
                  {perfume.tipo && <TechRow label="Concentración" value={perfume.tipo} />}
                  {perfume.uso && <TechRow label="Uso recomendado" value={perfume.uso} />}
                  {perfume.estilo && <TechRow label="Estilo" value={perfume.estilo} />}
                  {perfume.presentacion && <TechRow label="Presentación" value={perfume.presentacion} />}
                  <TechRow label="Volumen" value={`${perfume.volume_ml} ml`} />
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* CTA comprar */}
          <motion.div variants={fadeUp} className="pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={handleBuyNow} disabled={!inStock} className="rounded-xl border border-scentia-gold/50 px-3 py-4 font-semibold text-scentia-gold transition hover:bg-scentia-gold/10 disabled:opacity-40 disabled:cursor-not-allowed">
                {inStock ? getToken() ? "Realizar pedido" : "Inicia sesión" : "Sin stock"}
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition glow-gold"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingBag size={18} />
                  {inStock ? getToken() ? addedToCart ? "Agregar otro" : "Agregar al carrito" : "Inicia sesión" : "Sin stock"}
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </button>
            </div>

            {addedToCart && <Link href="/carrito" className="mt-3 block text-center text-sm text-scentia-gold hover:underline">Ver carrito</Link>}

            <p className="text-xs text-scentia-muted text-center mt-3">
              Confirmación inmediata por Telegram · Envío a domicilio
            </p>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-6 pt-4 text-xs text-scentia-muted"
          >
            <span className="flex items-center gap-1.5">
              <Star size={12} className="text-scentia-gold" />
              100% Original
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={12} className="text-scentia-gold" />
              Envío asegurado
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={12} className="text-scentia-gold" />
              Pago contra entrega
            </span>
          </motion.div>
        </motion.div>
      </div>
      {quickBuyItem && <CheckoutModal items={[quickBuyItem]} onClose={() => setQuickBuyItem(null)} onComplete={() => undefined} />}
    </>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-scentia-gold mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-scentia-muted">
          {label}
        </p>
        <p className="text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function CharRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 py-2 border-b border-scentia-border/40 last:border-0">
      <span className="text-xs uppercase tracking-widest text-scentia-muted sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-scentia-text/90">{value}</span>
    </div>
  );
}

function TechRow({ label, value }: { label: string; value: string | number }) {
  return (
    <tr className="border-b border-scentia-border/40 last:border-0">
      <td className="py-2.5 px-4 text-scentia-muted text-xs uppercase tracking-wider w-1/3">
        {label}
      </td>
      <td className="py-2.5 px-4 text-scentia-text/90">{value}</td>
    </tr>
  );
}
