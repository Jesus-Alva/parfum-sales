"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { api, uploadImage, imageUrl } from "@/lib/api";

const empty = {
  name: "",
  brand: "",
  description: "",
  gender: "unisex",
  family: "",
  notes: "",
  volume_ml: 100,
  price: 0,
  cost: 0,
  stock: 0,
  image_url: "",
};

interface PerfumeFormProps {
  perfume?: any; // Si viene, es modo edición
}

export default function PerfumeForm({ perfume }: PerfumeFormProps) {
  const router = useRouter();
  const isEdit = !!perfume;

  const [form, setForm] = useState<any>(perfume || empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen");
      return;
    }

    setError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen");
      return;
    }

    setError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImageFile(null);
    setPreviewUrl("");
    setForm((prev: any) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let finalImageUrl = form.image_url;

      // Subir imagen si hay una nueva seleccionada
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const payload = {
        name: form.name,
        brand: form.brand,
        description: form.description || "",
        gender: form.gender,
        family: form.family || "",
        notes: form.notes || "",
        volume_ml: Number(form.volume_ml),
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        image_url: finalImageUrl,
      };

      if (isEdit) {
        await api.put(`/perfumes/${perfume.id}`, payload);
      } else {
        await api.post("/perfumes/", payload);
      }

      router.push("/perfumes");
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al guardar el perfume");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full bg-scentia-card border border-scentia-border rounded-lg px-4 py-2 focus:outline-none focus:border-scentia-gold transition";
  const label = "block text-sm mb-1 text-scentia-muted";

  return (
    <form
      onSubmit={submit}
      className="glass rounded-2xl p-6 max-w-3xl space-y-5"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Nombre *</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            placeholder="Ej. Noir Extreme"
          />
        </div>

        <div>
          <label className={label}>Marca *</label>
          <input
            className={input}
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            required
            placeholder="Ej. Tom Ford"
          />
        </div>

        <div>
          <label className={label}>Género</label>
          <select
            className={input}
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          >
            <option value="masculine">Masculino</option>
            <option value="feminine">Femenino</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div>
          <label className={label}>Familia olfativa</label>
          <input
            className={input}
            value={form.family}
            onChange={(e) => update("family", e.target.value)}
            placeholder="Ej. Amaderado, Cítrico, Oriental"
          />
        </div>

        <div>
          <label className={label}>Volumen (ml)</label>
          <input
            type="number"
            min={1}
            className={input}
            value={form.volume_ml}
            onChange={(e) => update("volume_ml", e.target.value)}
          />
        </div>

        <div>
          <label className={label}>Stock</label>
          <input
            type="number"
            min={0}
            className={input}
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
          />
        </div>

        <div>
          <label className={label}>Costo (proveedor)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            className={input}
            value={form.cost}
            onChange={(e) => update("cost", e.target.value)}
          />
        </div>

        <div>
          <label className={label}>Precio de venta *</label>
          <input
            type="number"
            step="0.01"
            min={0}
            className={input}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={label}>Notas olfativas</label>
          <input
            className={input}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Ej. Bergamota, Cuero, Vainilla"
          />
        </div>

        {/* ── Imagen ─────────────────────────── */}
        <div className="md:col-span-2">
          <label className={label}>Imagen del perfume</label>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-scentia-border hover:border-scentia-gold rounded-xl p-6 cursor-pointer transition text-center bg-scentia-card/30"
          >
            {previewUrl ? (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-56 rounded-lg mx-auto object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition"
                  title="Quitar imagen"
                >
                  <X size={14} />
                </button>
                <p className="text-xs text-scentia-muted mt-2">
                  {imageFile?.name} ({((imageFile?.size || 0) / 1024).toFixed(1)} KB)
                </p>
              </div>
            ) : form.image_url ? (
              <div className="relative inline-block">
                <img
                  src={imageUrl(form.image_url)}
                  alt="Actual"
                  className="max-h-56 rounded-lg mx-auto object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition"
                  title="Quitar imagen"
                >
                  <X size={14} />
                </button>
                <p className="text-xs text-scentia-muted mt-2">
                  Imagen actual — click para reemplazar
                </p>
              </div>
            ) : (
              <div className="text-scentia-muted py-6">
                <Upload className="mx-auto mb-3 text-scentia-gold" size={36} />
                <p className="text-sm font-medium">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="text-xs mt-1 opacity-70">
                  JPG, PNG, WEBP · Máx 5MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* ── Descripción ─────────────────────── */}
        <div className="md:col-span-2">
          <label className={label}>Descripción</label>
          <textarea
            rows={3}
            className={input}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe esta fragancia..."
          />
        </div>
      </div>

      {/* ── Acciones ──────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {saving
            ? "Guardando..."
            : isEdit
            ? "Actualizar perfume"
            : "Guardar perfume"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/perfumes")}
          className="px-6 py-2.5 rounded-lg border border-scentia-border text-scentia-muted hover:text-scentia-text hover:border-scentia-gold/40 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}