"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Review = {
  id: number;
  user_id: number;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

type ReviewsResponse = {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
  my_review: Review | null;
};

export default function PerfumeReviews({ perfumeId }: { perfumeId: number }) {
  const [data, setData] = useState<ReviewsResponse>({ reviews: [], average_rating: 0, total_reviews: 0, my_review: null });
  const [isAuthed, setIsAuthed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReviews = useCallback(async () => {
    const response = await api.get<ReviewsResponse>(`/perfumes/${perfumeId}/reviews`);
    setData(response.data);
    if (response.data.my_review) {
      setRating(response.data.my_review.rating);
      setComment(response.data.my_review.comment);
    }
  }, [perfumeId]);

  useEffect(() => {
    const syncAuth = () => setIsAuthed(!!getToken());
    syncAuth();
    window.addEventListener("scentia:auth-change", syncAuth);
    return () => window.removeEventListener("scentia:auth-change", syncAuth);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadReviews()
      .catch((err) => setError(err?.response?.data?.detail || "No se pudieron cargar las reseñas."))
      .finally(() => setLoading(false));
  }, [loadReviews]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (rating < 1 || rating > 5) {
      setError("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/perfumes/${perfumeId}/reviews/me`, { rating, comment });
      await loadReviews();
      setNotice("Tu reseña se guardó correctamente.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo guardar tu reseña.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-scentia-border bg-scentia-bg px-4 py-3 text-sm focus:border-scentia-gold focus:outline-none";

  return (
    <section className="mt-16 border-t border-scentia-border pt-10" aria-labelledby="reviews-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="reviews-heading" className="font-display text-3xl text-gradient-gold">Opiniones de clientes</h2>
          <p className="mt-2 text-sm text-scentia-muted">Comparte tu experiencia con esta fragancia.</p>
        </div>
        <div className="flex items-center gap-2" aria-label={`Calificación promedio: ${data.average_rating} de 5`}>
          <span className="font-display text-3xl">{data.average_rating.toFixed(1)}</span>
          <div>
            <div className="flex text-scentia-gold">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} className={star <= Math.round(data.average_rating) ? "fill-current" : "text-scentia-muted/40"} />)}</div>
            <p className="mt-1 text-xs text-scentia-muted">{data.total_reviews} {data.total_reviews === 1 ? "reseña" : "reseñas"}</p>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      {notice && <div role="status" className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</div>}

      {isAuthed ? (
        <form onSubmit={submit} className="glass mt-6 space-y-4 rounded-2xl p-5">
          <h3 className="font-display text-xl">{data.my_review ? "Edita tu reseña" : "Deja tu reseña"}</h3>
          <fieldset>
            <legend className="mb-2 text-sm">Tu calificación</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`} aria-pressed={rating === star} className="rounded p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-scentia-gold">
                  <Star size={25} className={star <= rating ? "fill-scentia-gold text-scentia-gold" : "text-scentia-muted/50"} />
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor={`review-comment-${perfumeId}`} className="mb-2 block text-sm">Comentario</label>
            <textarea id={`review-comment-${perfumeId}`} className={inputClass} rows={4} minLength={1} maxLength={2000} required placeholder="¿Qué te pareció esta fragancia?" value={comment} onChange={(event) => setComment(event.target.value)} />
            <p className="mt-1 text-right text-xs text-scentia-muted">{comment.length}/2000</p>
          </div>
          <button type="submit" disabled={saving || rating < 1 || !comment.trim()} className="rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-5 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Guardando…" : data.my_review ? "Actualizar reseña" : "Publicar reseña"}
          </button>
        </form>
      ) : (
        <div className="glass mt-6 rounded-2xl p-5 text-sm text-scentia-muted">
          <Link href={`/login?next=/perfumes/${perfumeId}`} className="font-medium text-scentia-gold hover:underline">Inicia sesión</Link> para calificar y comentar este perfume.
        </div>
      )}

      <div className="mt-8 space-y-4">
        {loading ? <p className="text-sm text-scentia-muted">Cargando reseñas…</p> : data.reviews.length === 0 ? (
          <p className="rounded-xl border border-scentia-border p-5 text-sm text-scentia-muted">Aún no hay reseñas. Sé la primera persona en opinar.</p>
        ) : data.reviews.map((review) => (
          <article key={review.id} className="glass rounded-2xl p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium">{review.author_name}</h3>
                <time dateTime={review.created_at} className="text-xs text-scentia-muted">{new Date(review.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</time>
              </div>
              <div className="flex items-center gap-1 text-scentia-gold" aria-label={`${review.rating} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} className={star <= review.rating ? "fill-current" : "text-scentia-muted/40"} />)}
                <span className="ml-1 text-xs text-scentia-muted">{review.rating}/5</span>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-scentia-text/90">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
