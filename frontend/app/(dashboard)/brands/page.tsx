"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { api, imageUrl, uploadBrandLogo } from "@/lib/api";

type Brand = { id: number; name: string; logo_url: string };

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBrands = () => api.get("/brands/").then((response) => setBrands(response.data));

  useEffect(() => {
    loadBrands().catch(() => setError("No se pudieron cargar las marcas.")).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setName("");
    setLogoUrl("");
    setLogoFile(null);
    setEditingId(null);
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const finalLogoUrl = logoFile ? await uploadBrandLogo(logoFile) : logoUrl;
      const payload = { name: name.trim(), logo_url: finalLogoUrl };
      if (editingId) {
        await api.put(`/brands/${editingId}`, payload);
      } else {
        await api.post("/brands/", payload);
      }
      await loadBrands();
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo guardar la marca.");
    } finally {
      setSaving(false);
    }
  };

  const editBrand = (brand: Brand) => {
    setEditingId(brand.id);
    setName(brand.name);
    setLogoUrl(brand.logo_url || "");
    setLogoFile(null);
    setError("");
  };

  const deleteBrand = async (brand: Brand) => {
    if (!confirm(`¿Eliminar la marca "${brand.name}"?`)) return;
    setError("");
    try {
      await api.delete(`/brands/${brand.id}`);
      setBrands((current) => current.filter((item) => item.id !== brand.id));
      if (editingId === brand.id) resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo eliminar la marca.");
    }
  };

  const input = "w-full rounded-lg border border-scentia-border bg-scentia-card px-4 py-2 focus:border-scentia-gold focus:outline-none";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gradient-gold">Marcas</h1>
        <p className="mt-1 text-sm text-scentia-muted">Administra las marcas y sus logotipos para asignarlos a los perfumes.</p>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <form onSubmit={submit} className="glass grid gap-4 rounded-2xl p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="brand-name" className="mb-1 block text-sm">Nombre de la marca</label>
          <input id="brand-name" className={input} value={name} onChange={(event) => setName(event.target.value)} maxLength={255} required />
        </div>
        <div>
          <label htmlFor="brand-logo" className="mb-1 block text-sm">Logotipo (opcional)</label>
          <input
            id="brand-logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className={`${input} file:mr-3 file:rounded-md file:border-0 file:bg-scentia-gold/15 file:px-3 file:py-1 file:text-scentia-gold`}
            onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
          />
          {logoFile && <p className="mt-1 text-xs text-scentia-muted">Se subirá: {logoFile.name}</p>}
          {!logoFile && logoUrl && (
            <div className="mt-1 flex items-center gap-2 text-xs text-scentia-muted">
              <span>Logotipo actual agregado</span>
              <button type="button" onClick={() => setLogoUrl("")} className="text-red-300 hover:underline">Quitar</button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-4 py-2 font-semibold text-black disabled:opacity-50">
            {editingId ? <Pencil size={16} /> : <Plus size={16} />}
            {saving ? "Guardando…" : editingId ? "Actualizar" : "Agregar"}
          </button>
          {editingId && <button type="button" onClick={resetForm} aria-label="Cancelar edición" className="rounded-lg border border-scentia-border px-3 text-scentia-muted hover:text-scentia-text"><X size={18} /></button>}
        </div>
      </form>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-scentia-border px-5 py-4">
          <h2 className="font-display text-xl">Marcas registradas</h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-scentia-muted">Cargando marcas…</p>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-scentia-muted">
            <Tags size={28} className="text-scentia-gold" />
            <p>Aún no hay marcas. Registra una para poder asignarla a un perfume.</p>
          </div>
        ) : (
          <ul className="divide-y divide-scentia-border">
            {brands.map((brand) => (
              <li key={brand.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-scentia-border bg-scentia-bg p-1">
                  {brand.logo_url ? <img src={imageUrl(brand.logo_url)} alt={`Logotipo de ${brand.name}`} className="max-h-full max-w-full object-contain" /> : <span className="font-display text-2xl text-scentia-gold/50">{brand.name.charAt(0)}</span>}
                </div>
                <span className="min-w-0 flex-1 font-medium">{brand.name}</span>
                <button type="button" onClick={() => editBrand(brand)} className="rounded-lg border border-scentia-border p-2 text-scentia-muted hover:border-scentia-gold/50 hover:text-scentia-gold" aria-label={`Editar ${brand.name}`}><Pencil size={16} /></button>
                <button type="button" onClick={() => deleteBrand(brand)} className="rounded-lg border border-scentia-border p-2 text-scentia-muted hover:border-red-500/50 hover:text-red-400" aria-label={`Eliminar ${brand.name}`}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
