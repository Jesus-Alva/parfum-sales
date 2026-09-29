"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MagneticButton from "@/components/shared/MageneticButton";
import { getToken } from "@/lib/auth";

export default function Hero() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ... blobs animados ... */}

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p className="uppercase tracking-[0.4em] text-sm text-scentia-gold mb-6">
          Perfumería de autor
        </motion.p>

        <motion.h1 className="font-display text-6xl md:text-8xl leading-none mb-6">
          <span className="text-gradient-gold">Scentia</span>
        </motion.h1>

        <motion.p className="text-lg md:text-xl text-scentia-muted max-w-2xl mx-auto mb-10">
          Fragancias que cuentan historias. Descubre, elige y registra tu compra
          en un clic con confirmación inmediata.
        </motion.p>

        <motion.div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            onClick={() =>
              document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explorar colección
          </MagneticButton>

          {isAuthed ? (
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-full border border-scentia-gold/40 text-scentia-gold hover:bg-scentia-gold/10 transition"
            >
              Ir al panel
            </a>
          ) : (
            <a
              href="/register"
              className="px-6 py-3 rounded-full border border-scentia-gold/40 text-scentia-gold hover:bg-scentia-gold/10 transition"
            >
              Crear cuenta
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}