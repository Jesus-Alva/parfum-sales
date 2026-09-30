"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { imageUrl } from "@/lib/api";

export default function ImageGallery({ images, name }: { images: any[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-scentia-card to-scentia-bg flex items-center justify-center">
        <span className="font-display text-7xl text-scentia-gold/40">S</span>
      </div>
    );
  }

  const current = images[active];
  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <>
      {/* Imagen principal */}
      <div className="relative group">
        <motion.img
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={imageUrl(current.url)}
          alt={name}
          className="w-full aspect-square object-cover rounded-2xl cursor-zoom-in"
          onClick={() => setLightbox(true)}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === active
                  ? "border-scentia-gold"
                  : "border-transparent hover:border-scentia-gold/40"
              }`}
            >
              <img src={imageUrl(img.url)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
              onClick={() => setLightbox(false)}
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            <motion.img
              key={current.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={imageUrl(current.url)}
              alt={name}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <p className="absolute bottom-4 text-white/60 text-sm">
              {active + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}