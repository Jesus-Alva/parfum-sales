"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import { api } from "@/lib/api";

type PerfumeReview = {
  id: number;
  perfume_id: number;
  perfume_name: string;
  brand: string;
  author_name: string;
  rating: number;
  comment: string;
};

export default function Testimonials() {
  const [reviews, setReviews] = useState<PerfumeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .get<PerfumeReview[]>("/reviews/random", { params: { limit: 3 } })
      .then(({ data }) => setReviews(data))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="testimonials" className="scroll-mt-24 py-24 px-6">
      <h2 className="font-display text-4xl text-center mb-16">
        Opiniones sobre nuestros <span className="text-gradient-gold">perfumes</span>
      </h2>
      {loading ? (
        <p className="text-center text-scentia-muted">Cargando opiniones…</p>
      ) : reviews.length === 0 ? (
        <p className="mx-auto max-w-2xl text-center text-scentia-muted">
          {loadError
            ? "No se pudieron cargar las opiniones en este momento."
            : "Aún no hay comentarios publicados. Cuando haya reseñas, aparecerán aquí."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass flex flex-col rounded-2xl p-6"
            >
              <div className="mb-4 flex gap-1 text-scentia-gold" aria-label={`${review.rating} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} className={star <= review.rating ? "fill-current" : "text-scentia-muted/40"} />
                ))}
              </div>
              <blockquote className="mb-6 flex-1 whitespace-pre-line text-scentia-text/90">
                “{review.comment}”
              </blockquote>
              <div className="border-t border-scentia-border pt-4">
                <p className="text-sm font-semibold text-scentia-gold">{review.author_name}</p>
                <Link href={`/perfumes/${review.perfume_id}`} className="mt-1 block text-sm text-scentia-muted hover:text-scentia-gold">
                  {review.brand ? `${review.brand} · ` : ""}{review.perfume_name}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
