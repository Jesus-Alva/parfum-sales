"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, imageUrl as resolveImageUrl, uploadImage } from "@/lib/api";

type BasePerfume = {
  id: number;
  name: string;
  brand: string;
  image_url: string;
  volume_ml: number;
  family: string;
  gender: string;
  description: string;
  notes: string;
  tipo: string;
  perfil: string;
  estilo: string;
  uso: string;
  presentacion: string;
};

export default function DecanterForm({ decanter }: { decanter?: any }) {
  const router = useRouter();
  const [perfumes, setPerfumes] = useState<BasePerfume[]>([]);
  const [form, setForm] = useState({
    perfume_id: decanter?.perfume_id ? String(decanter.perfume_id) : "",
    volume_ml: decanter?.volume_ml ?? "",
    price: decanter?.price ?? "",
    stock: decanter?.stock ?? 0,
  });
  const [decanterImageUrl, setDecanterImageUrl] = useState<string>(decanter?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const input = "w-full rounded-lg border border-scentia-border bg-scentia-card px-4 py-2 focus:border-scentia-gold focus:outline-none disabled:opacity-50";
  const selectedPerfume = perfumes.find((perfume) => perfume.id === Number(form.perfume_id));

  useEffect(() => {
    api.get("/decanters/perfumes")
      .then((response) => setPerfumes(response.data))
      .catch((e) => setError(e?.response?.data?.detail || "No se pudieron cargar los perfumes."));
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }
    const preview = URL.createObjectURL(imageFile);
    setImagePreviewUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const savedImageUrl = imageFile ? await uploadImage(imageFile) : decanterImageUrl;
      const payload = {
        perfume_id: Number(form.perfume_id),
        volume_ml: Number(form.volume_ml),
        price: Number(form.price),
        stock: Number(form.stock),
        image_url: savedImageUrl,
      };
      if (decanter) await api.put(`/decanters/${decanter.id}`, payload);
      else await api.post("/decanters/", payload);
      router.push("/decanters");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "No se pudo guardar el decanter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass max-w-3xl space-y-5 rounded-2xl p-6">
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <div>
        <label htmlFor="base-perfume" className="mb-1 block text-sm">Perfume</label>
        <select id="base-perfume" className={input} required value={form.perfume_id} onChange={(event) => update("perfume_id", event.target.value)}>
          <option value="">Selecciona el perfume base</option>
          {perfumes.map((perfume) => <option key={perfume.id} value={perfume.id}>{perfume.brand} · {perfume.name} ({perfume.volume_ml} ml)</option>)}
        </select>
        {perfumes.length === 0 && <Link href="/perfumes/new" className="mt-2 inline-block text-xs text-scentia-gold hover:underline">Primero registra un perfume base.</Link>}
      </div>

      {selectedPerfume && <div className="rounded-xl border border-scentia-border bg-scentia-card/60 p-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-scentia-gold">Características heredadas</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <span>{selectedPerfume.brand} · {selectedPerfume.name}</span>
          {selectedPerfume.family && <span>{selectedPerfume.family}</span>}
          {selectedPerfume.tipo && <span>{selectedPerfume.tipo}</span>}
          <span>{selectedPerfume.volume_ml} ml (frasco base)</span>
        </div>
        {selectedPerfume.description && <p className="mt-2 text-sm text-scentia-muted">{selectedPerfume.description}</p>}
        <p className="mt-2 text-xs text-scentia-muted">Marca, imágenes, género, familia, notas y características se copian automáticamente.</p>
      </div>}

      <div className="rounded-xl border border-scentia-border p-4">
        <label htmlFor="decanter-image" className="mb-2 block text-sm">Imagen del decanter (opcional)</label>
        <p className="mb-3 text-xs text-scentia-muted">Esta imagen se mostrará al elegir la presentación decanter. Si no agregas una, se usarán las imágenes del perfume base.</p>
        {(imagePreviewUrl || decanterImageUrl || selectedPerfume?.image_url) && <div className="mb-3 flex items-center gap-3">
          <img src={imagePreviewUrl || resolveImageUrl(decanterImageUrl || selectedPerfume?.image_url || "")} alt="Vista previa del decanter" className="h-24 w-24 rounded-lg border border-scentia-border object-cover" />
          <span className="text-xs text-scentia-muted">{imagePreviewUrl || decanterImageUrl ? "Imagen propia del decanter" : "Imagen de respaldo del perfume"}</span>
        </div>}
        <input key={imageFile?.name || "empty"} id="decanter-image" type="file" accept="image/*" className="block w-full text-sm text-scentia-muted file:mr-3 file:rounded-lg file:border-0 file:bg-scentia-gold/15 file:px-3 file:py-2 file:text-scentia-gold" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
        {(imageFile || decanterImageUrl) && <button type="button" className="mt-2 text-xs text-red-300 hover:underline" onClick={() => { setImageFile(null); setDecanterImageUrl(""); }}>Quitar imagen propia</button>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="decanter-volume" className="mb-1 block text-sm">Contenido (ml)</label>
          <input id="decanter-volume" type="number" min="1" step="1" required className={input} value={form.volume_ml} onChange={(event) => update("volume_ml", event.target.value)} placeholder="Ej. 8" />
        </div>
        <div>
          <label htmlFor="decanter-price" className="mb-1 block text-sm">Precio</label>
          <input id="decanter-price" type="number" min="0.01" step="0.01" required className={input} value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="$0.00" />
        </div>
        <div>
          <label htmlFor="decanter-stock" className="mb-1 block text-sm">Stock (unidades)</label>
          <input id="decanter-stock" type="number" min="0" step="1" required className={input} value={form.stock} onChange={(event) => update("stock", event.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading || !selectedPerfume} className="rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-6 py-2.5 font-semibold text-black transition hover:opacity-90 disabled:opacity-50">
          {loading ? "Guardando..." : decanter ? "Actualizar decanter" : "Registrar decanter"}
        </button>
        <button type="button" onClick={() => router.push("/decanters")} className="rounded-lg border border-scentia-border px-6 py-2.5 text-scentia-muted transition hover:text-scentia-text">Cancelar</button>
      </div>
    </form>
  );
}
