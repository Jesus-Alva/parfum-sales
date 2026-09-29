"use client";
import { motion } from "framer-motion";
import { Sparkles, Shield, Truck, Bell } from "lucide-react";

const features = [
  { icon: Sparkles, title: "Fragancias premium", desc: "Selección curada de las mejores casas." },
  { icon: Shield, title: "Compra segura", desc: "Registro cifrado y transparente." },
  { icon: Truck, title: "Envío ágil", desc: "Confirmación en segundos por Telegram." },
  { icon: Bell, title: "Notificación instantánea", desc: "Recibes el folio al momento." },
];

export default function Features() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent to-scentia-card/40">
      <h2 className="font-display text-4xl text-center mb-16">
        ¿Por qué <span className="text-gradient-gold">Scentia</span>?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 hover:glow-gold transition"
          >
            <f.icon className="text-scentia-gold mb-4" size={32} />
            <h3 className="font-display text-xl mb-2">{f.title}</h3>
            <p className="text-sm text-scentia-muted">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}