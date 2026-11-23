"use client";

import { motion } from "framer-motion";
import { MapPin, Store } from "lucide-react";

export default function AboutUs() {
  return (
    <section id="nosotros" className="scroll-mt-24 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
        className="glass mx-auto grid max-w-6xl gap-10 rounded-3xl p-8 md:grid-cols-[1.2fr_0.8fr] md:p-12"
      >
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-scentia-gold">
            Sobre nosotros
          </p>
          <h2 className="mb-6 font-display text-4xl md:text-5xl">
            Fragancias originales, <span className="text-gradient-gold">cerca de ti</span>
          </h2>
          <p className="max-w-2xl leading-relaxed text-scentia-muted">
            Somos ScentiA, una distribuidora de perfumes originales de distintas
            marcas. Somos un pequeño emprendimiento local que atiende el
            municipio de Tecámac y sus alrededores. No contamos con tienda
            física; coordinamos entregas en distintos puntos establecidos para
            que elijas el que mejor te convenga.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-start gap-4 rounded-2xl border border-scentia-border bg-black/10 p-5">
            <MapPin className="mt-1 shrink-0 text-scentia-gold" size={22} aria-hidden="true" />
            <div>
              <h3 className="mb-1 font-semibold">Tecámac y alrededores</h3>
              <p className="text-sm text-scentia-muted">
                Emprendimiento local con puntos de encuentro establecidos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-scentia-border bg-black/10 p-5">
            <Store className="mt-1 shrink-0 text-scentia-gold" size={22} aria-hidden="true" />
            <div>
              <h3 className="mb-1 font-semibold">Atención en línea</h3>
              <p className="text-sm text-scentia-muted">
                No tenemos tienda física. Elige tu perfume y coordina la entrega
                desde el sitio.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
