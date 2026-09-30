"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
import CheckoutModal from "@/components/sales/CheckoutModal";

export default function PerfumeDetailView({ perfume }: { perfume: any }) {
  const router = useRouter();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Galería: si tiene imágenes múltiples, usa perfume.images;
  // si no, cae al cover (image_url) como única imagen
  const images =
    perfume.images && perfume.images.length > 0
      ? perfume.images
      : perfume.image_url
      ? [{ id: 0, url: perfume.image_url, position: 0 }]
      : [];

  const handleBuy = () => {
    if (!getToken()) {
      router.push(`/login?next=/perfumes/${perfume.id}`);
      return;
    }
    setCheckoutOpen(true);
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  inStock
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    inStock ? "bg-green-400" : "bg-red-400"
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

          {/* Especificaciones */}
          <motion.div
            variants={fadeUp}
            className="glass rounded-2xl p-5 grid grid-cols-2 gap-4"
          >
            <Spec icon={<Tag size={14} />} label="Marca" value={perfume.brand} />
            <Spec
              icon={<UserIcon size={14} />}
              label="Género"
              value={
                perfume.gender === "masculine"
                  ? "Masculino"
                  : perfume.gender === "feminine"
                  ? "Femenino"
                  : "Unisex"
              }
            />
            <Spec
              icon={<Droplets size={14} />}
              label="Volumen"
              value={`${perfume.volume_ml} ml`}
            />
            <Spec
              icon={<Package size={14} />}
              label="Stock"
              value={perfume.stock}
            />
            {perfume.family && (
              <Spec
                icon={<Sparkles size={14} />}
                label="Familia"
                value={perfume.family}
              />
            )}
          </motion.div>

          {/* CTA comprar */}
          <motion.div variants={fadeUp} className="pt-2">
            <button
              onClick={handleBuy}
              disabled={!inStock}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition glow-gold"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ShoppingBag size={18} />
                {inStock
                  ? getToken()
                    ? "Comprar ahora"
                    : "Inicia sesión para comprar"
                  : "Sin stock"}
              </span>
              {/* Shimmer */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </button>

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

      {/* Modal de checkout */}
      {checkoutOpen && (
        <CheckoutModal perfume={perfume} onClose={() => setCheckoutOpen(false)} />
      )}
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