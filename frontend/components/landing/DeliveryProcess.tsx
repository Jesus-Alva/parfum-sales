"use client";

import { motion } from "framer-motion";
import { Banknote, ClipboardCheck, ShoppingBag, Smartphone } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingBag,
    title: "Elige tus perfumes",
    description:
      "Agrega varios perfumes al carrito o inicia un pedido rápido desde el producto que te gustó.",
  },
  {
    number: "02",
    icon: Smartphone,
    title: "Déjanos tus datos",
    description:
      "Completa el formulario con tu nombre y número de celular, y selecciona uno de los puntos de entrega disponibles.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Consulta el estatus",
    description:
      "Al registrarse tu pedido, el equipo de ScentiA recibe una notificación. Después puedes consultar el estatus en la sección Mis pedidos.",
  },
  {
    number: "04",
    icon: Banknote,
    title: "Paga al recibirlo",
    description:
      "El pago se realiza al momento de la entrega, en el punto que elegiste.",
  },
];

export default function DeliveryProcess() {
  return (
    <section id="entregas" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-scentia-gold">
            Entrega local
          </p>
          <h2 className="mb-5 font-display text-4xl md:text-5xl">
            Tu pedido, <span className="text-gradient-gold">paso a paso</span>
          </h2>
          <p className="leading-relaxed text-scentia-muted">
            No realizamos envíos a domicilio ni por paquetería. Las entregas se
            hacen en puntos establecidos que puedes seleccionar al hacer tu
            pedido. Cada punto muestra su día y horario habitual.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <motion.article
              key={number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="glass relative overflow-hidden rounded-2xl p-6"
            >
              <span className="absolute right-5 top-4 font-display text-4xl text-scentia-gold/20">
                {number}
              </span>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-scentia-gold/30 bg-scentia-gold/10 text-scentia-gold">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="mb-3 font-display text-xl">{title}</h3>
              <p className="text-sm leading-relaxed text-scentia-muted">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
