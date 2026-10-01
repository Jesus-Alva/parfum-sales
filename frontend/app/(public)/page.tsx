
"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "@/components/landing/Hero";
import PerfumeShowcase from "@/components/landing/PerfumeShowcase";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

function ForbiddenBanner() {
  const params = useSearchParams();
  if (params.get("forbidden") !== "1") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-full px-5 py-2 backdrop-blur"
    >
      No tienes permisos para acceder a esa sección
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Suspense>
        <ForbiddenBanner />
      </Suspense>
      <Hero />
      <PerfumeShowcase />
      <Features />
      <Testimonials />
    </main>
  );
}