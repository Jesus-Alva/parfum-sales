"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { getToken } from "@/lib/auth";

type Phase = "welcome" | "flash" | "brand";

export default function WelcomeSplash() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("welcome");
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/dashboard") return;
    if (sessionStorage.getItem("scentia_show_welcome") !== "1" || !getToken()) return;

    // Consume the one-time login marker so a normal reload won't replay the splash.
    sessionStorage.removeItem("scentia_show_welcome");
    const savedName = localStorage.getItem("scentia_full_name")?.trim() || "";
    setName(savedName.split(/\s+/)[0] || "");
    setPhase("welcome");
    setVisible(true);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;

    const welcomeDuration = reducedMotion ? 800 : 1500;
    const flashDuration = reducedMotion ? 250 : 550;
    const brandDuration = reducedMotion ? 850 : 1500;
    const flashTimer = window.setTimeout(() => setPhase("flash"), welcomeDuration);
    const brandTimer = window.setTimeout(() => setPhase("brand"), welcomeDuration + flashDuration);
    const exitTimer = window.setTimeout(
      () => setVisible(false),
      welcomeDuration + flashDuration + brandDuration,
    );

    return () => {
      window.clearTimeout(flashTimer);
      window.clearTimeout(brandTimer);
      window.clearTimeout(exitTimer);
    };
  }, [visible, reducedMotion]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="welcome-splash"
          role="status"
          aria-live="polite"
          aria-label={`Bienvenido${name ? `, ${name}` : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.15 : 0.6 } }}
          className="fixed inset-0 z-[2147483000] flex items-center justify-center overflow-hidden bg-scentia-bg px-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.24),transparent_58%)]" />

          <AnimatePresence mode="wait">
            {phase === "welcome" && (
              <motion.h1
                key="welcome-text"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
                transition={{ duration: reducedMotion ? 0.2 : 0.65 }}
                className="relative text-center font-display text-4xl text-scentia-text sm:text-6xl"
              >
                ¡Bienvenido{name ? `, ${name}` : ""}!
              </motion.h1>
            )}

            {phase === "flash" && (
              <motion.div
                key="welcome-flash"
                aria-hidden="true"
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.25 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: [0, 1, 0], scale: [0.25, 1.15, 1.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.2 : 0.55, ease: "easeOut" }}
                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-scentia-gold/20 text-scentia-gold shadow-[0_0_100px_50px_rgba(212,175,55,0.32)]"
              >
                <Sparkles size={98} strokeWidth={0.7} className="absolute opacity-25" />
                <Image
                  src="/images/brand/icon.png"
                  alt=""
                  width={201}
                  height={207}
                  className="relative h-20 w-20 object-contain drop-shadow-[0_0_22px_rgba(212,175,55,0.8)]"
                  priority
                />
              </motion.div>
            )}

            {phase === "brand" && (
              <motion.div
                key="brand-text"
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.88, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: reducedMotion ? 0.2 : 0.7, ease: "easeOut" }}
                className="relative h-[190px] w-[330px] sm:h-[250px] sm:w-[440px]"
              >
                <Image
                  src="/images/brand/logo-complete.png"
                  alt="ScentiA"
                  fill
                  sizes="(max-width: 640px) 330px, 440px"
                  className="object-contain"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
