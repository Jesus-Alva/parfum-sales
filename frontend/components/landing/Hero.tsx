"use client";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { getToken } from "@/lib/auth";
import MagneticButton from "@/components/shared/MageneticButton";

export default function Hero() {
  const [isAuthed, setIsAuthed] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  // Posición del cursor (porcentaje)
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  // Suavizado del movimiento
  const springX = useSpring(mouseX, { stiffness: 120, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 25 });

  // Tamaño del foco (con suavizado propio)
  const radius = useMotionValue(0);
  const springRadius = useSpring(radius, { stiffness: 100, damping: 20 });

  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setHovering(true);
    radius.set(500); // expande el foco
  };

  const handleMouseLeave = () => {
    setHovering(false);
    radius.set(0); // colapsa el foco
  };

  // Máscara radial que sigue al cursor
  const maskImage = useMotionTemplate`radial-gradient(
    ${springRadius}px circle at ${springX}% ${springY}%,
    black 0%,
    black 30%,
    transparent 75%
  )`;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── CAPA 1: IMAGEN OSCURA (siempre visible) ──────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-forest.jpg')",
          filter: "brightness(0.28) saturate(0.75) contrast(1.05)",
        }}
      />

      {/* ── CAPA 2: OVERLAY OSCURO FIJO ────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(10,10,15,0.5), rgba(10,10,15,0.85) 75%)",
        }}
      />

      {/* ── CAPA 3: IMAGEN BRILLANTE ENMASCARADA ──────── */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/hero-forest.jpg')",
          filter: "brightness(1.15) saturate(1.35) contrast(1.05)",
          maskImage: maskImage,
          WebkitMaskImage: maskImage,
          // Añade un glow dorado dentro del foco
          mixBlendMode: "screen",
        }}
      />

      {/* ── CAPA 4: HALO DORADO (refuerza el centro del foco) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useMotionTemplate`radial-gradient(
            ${springRadius}px circle at ${springX}% ${springY}%,
            rgba(255, 220, 160, 0.25) 0%,
            rgba(212, 175, 55, 0.1) 40%,
            transparent 70%
          )`,
          mixBlendMode: "overlay",
          opacity: hovering ? 1 : 0,
          transition: "opacity 0.5s ease-out",
        }}
      />

      {/* ── CAPA 5: VIÑETA (oscurece bordes para dar profundidad) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* ── PARTÍCULAS DORADAS ───────────────────────────── */}
      <Particles />

      {/* ── GRADIENTE INFERIOR ───────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-scentia-bg to-transparent pointer-events-none z-10" />

      {/* ── CONTENIDO ────────────────────────────────────── */}
      <div className="relative z-20 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="uppercase tracking-[0.4em] text-sm text-scentia-gold mb-6"
        >
          Perfumería de autor
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-6xl md:text-8xl leading-none mb-6 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
        >
          <span className="text-gradient-gold">Scentia</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-xl text-scentia-text/90 max-w-2xl mx-auto mb-10 drop-shadow-lg"
        >
          Fragancias que cuentan historias. Descubre, elige y registra tu compra
          en un clic con confirmación inmediata.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton
            onClick={() =>
              document
                .getElementById("showcase")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explorar colección
          </MagneticButton>

          {isAuthed ? (
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-full border border-scentia-gold/40 text-scentia-gold hover:bg-scentia-gold/10 transition backdrop-blur-sm"
            >
              Ir al panel
            </a>
          ) : (
            <a
              href="/register"
              className="px-6 py-3 rounded-full border border-scentia-gold/40 text-scentia-gold hover:bg-scentia-gold/10 transition backdrop-blur-sm"
            >
              Crear cuenta
            </a>
          )}
        </motion.div>
      </div>

      {/* ── INDICADOR SCROLL ─────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="w-5 h-9 border border-scentia-gold/40 rounded-full flex justify-center p-1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-2 rounded-full bg-scentia-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Partículas doradas flotantes ─────────────────────
function Particles() {
  const particles = Array.from({ length: 25 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const size = Math.random() * 3 + 1;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = Math.random() * 12 + 8;
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-scentia-gold"
            style={{
              width: size,
              height: size,
              left: `${startX}%`,
              top: `${startY}%`,
              boxShadow: `0 0 ${size * 3}px rgba(212, 175, 55, 0.8)`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}