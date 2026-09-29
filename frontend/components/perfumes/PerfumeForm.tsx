"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const empty = {
  name: "", brand: "", description: "", gender: "unisex",
  family: "", notes: "", volume_ml: 100, price: 0, cost: 0,
  stock: 0, image_url: "",
};

export default function PerfumeForm({ perfume }: { perfume?: any }) {
  const router = useRouter();
  const isEdit = !!perfume;
  const [form, setForm] = useState<any>(perfume || empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        volume_ml: Number(form.volume_ml),
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
      };
      if (isEdit) {
        await api.put(`/perfumes/${perfume.id}`, payload);
      } else {
        await api.post("/perfumes/", payload);
      }
      router.push("/perfumes");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full bg-scentia-card border border-scentia-border rounded-lg px-4 py-2 focus:outline-none focus:border-scentia-gold";

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6 max-w-3xl space-y-4">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input className={input} value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Marca</label>
          <input className={input} value={form.brand} onChange={(e) => update("brand", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Género</label>
          <select className={input} value={form.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="masculine">Masculino</option>
            <option value="feminine">Femenino</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Familia olfativa</label>
          <input className={input} value={form.family} onChange={(e) => update("family", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Volumen (ml)</label>
          <input type="number" className={input} value={form.volume_ml} onChange={(e) => update("volume_ml", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Stock</label>
          <input type="number" className={input} value={form.stock} onChange={(e) => update("stock", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Costo</label>
          <input type="number" step="0.01" className={input} value={form.cost} onChange={(e) => update("cost", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Precio</label>
          <input type="number" step="0.01" className={input} value={form.price} onChange={(e) => update("price", e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Notas</label>
          <input className={input} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">URL de imagen</label>
          <input className={input} value={form.image_url} onChange={(e) => update("image_url", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Descripción</label>
          <textarea rows={3} className={input} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Guardando..." : isEdit ? "Actualizar" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/perfumes")}
          className="px-6 py-2.5 rounded-lg border border-scentia-border text-scentia-muted hover:text-scentia-text transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}