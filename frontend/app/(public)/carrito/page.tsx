"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { imageUrl } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import CheckoutModal from "@/components/sales/CheckoutModal";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-[70vh] px-6 pb-16"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <ShoppingBag className="text-scentia-gold" />
          <div>
            <h1 className="font-display text-4xl text-gradient-gold">Carrito de compras</h1>
            <p className="mt-1 text-sm text-scentia-muted">Revisa tus perfumes antes de confirmar el pedido.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-scentia-muted">Aún no agregas perfumes al carrito.</p>
            <Link href="/catalogo" className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-5 py-2.5 font-semibold text-black">Explorar catálogo</Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.article
                  key={item.perfumeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="glass flex gap-4 rounded-2xl p-4"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-scentia-card">
                    {item.imageUrl ? <img src={imageUrl(item.imageUrl)} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-display text-3xl text-scentia-gold/40">S</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-widest text-scentia-gold">{item.brand}</p>
                    <h2 className="mt-1 truncate font-display text-xl">{item.name}</h2>
                    <p className="mt-1 text-sm text-scentia-muted">${item.price.toFixed(2)} c/u · {item.stock} disponibles</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 rounded-lg border border-scentia-border px-2 py-1">
                        <button type="button" onClick={() => updateQuantity(item.perfumeId, item.quantity - 1)} aria-label={`Quitar una unidad de ${item.name}`} className="p-1 text-scentia-muted hover:text-scentia-gold"><Minus size={14} /></button>
                        <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.perfumeId, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label={`Agregar una unidad de ${item.name}`} className="p-1 text-scentia-muted hover:text-scentia-gold disabled:opacity-40"><Plus size={14} /></button>
                      </div>
                      <span className="font-semibold text-scentia-gold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(item.perfumeId)} aria-label={`Eliminar ${item.name} del carrito`} className="h-fit rounded-lg p-2 text-scentia-muted hover:bg-red-500/10 hover:text-red-300"><Trash2 size={16} /></button>
                </motion.article>
              ))}
              <Link href="/catalogo" className="inline-block pt-2 text-sm text-scentia-gold hover:underline">← Seguir explorando</Link>
            </div>

            <aside className="glass h-fit rounded-2xl p-5">
              <h2 className="font-display text-xl text-scentia-gold">Resumen</h2>
              <div className="mt-4 flex justify-between text-sm text-scentia-muted"><span>Productos</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
              <div className="mt-3 flex justify-between border-t border-scentia-border pt-3 text-lg font-semibold"><span>Total</span><span className="text-scentia-gold">${total.toFixed(2)}</span></div>
              <p className="mt-3 text-xs text-scentia-muted">En el siguiente paso podrás elegir el punto de entrega local o agregar el domicilio para paquetería.</p>
              <button type="button" onClick={() => setCheckoutOpen(true)} className="mt-5 w-full rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft py-2.5 font-semibold text-black">Continuar compra</button>
            </aside>
          </div>
        )}
      </div>
      {checkoutOpen && items.length > 0 && <CheckoutModal items={items} onClose={() => setCheckoutOpen(false)} onComplete={clear} />}
    </motion.main>
  );
}
