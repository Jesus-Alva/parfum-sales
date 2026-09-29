"use client";
import { motion } from "framer-motion";

const items = [
  { name: "Mariana R.", text: "El proceso es tan elegante como los perfumes. ¡Enamorada!" },
  { name: "Carlos M.", text: "Recibí la confirmación por Telegram casi al instante." },
  { name: "Lucía F.", text: "La atención y el detalle en cada fragancia, increíble." },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6">
      <h2 className="font-display text-4xl text-center mb-16">
        Lo que dicen nuestros <span className="text-gradient-gold">clientes</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {items.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="glass rounded-2xl p-6"
          >
            <p className="italic text-scentia-muted mb-4">“{t.text}”</p>
            <p className="text-scentia-gold font-semibold text-sm">— {t.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}