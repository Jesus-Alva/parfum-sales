"use client";
import { useRef, useState } from "react";
import { Upload, X, Star } from "lucide-react";
import { imageUrl } from "@/lib/api";

type Props = {
  existing: { id: number; url: string }[];
  newFiles: File[];
  onChange: (files: File[]) => void;
  onRemoveExisting: (id: number) => void;
  onSetCover: (url: string) => void;
  coverUrl: string;
};

export default function MultiImageUpload({
  existing,
  newFiles,
  onChange,
  onRemoveExisting,
  onSetCover,
  coverUrl,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");

  const processFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return;

    const arr = Array.from(fileList);
    if (arr.length === 0) return;

    const rejected: string[] = [];
    const accepted: File[] = [];

    arr.forEach((f) => {
      if (!f.type.startsWith("image/")) {
        rejected.push(`${f.name}: no es imagen`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        rejected.push(`${f.name}: supera 5MB`);
        return;
      }
      accepted.push(f);
    });

    if (rejected.length > 0) {
      setLocalError(rejected.join(" · "));
    } else {
      setLocalError("");
    }

    if (accepted.length > 0) {
      onChange([...newFiles, ...accepted]);   // ✅ append
    }

    // Reset input para permitir subir el mismo archivo otra vez
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const total = existing.length + newFiles.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm">Imágenes del perfume</label>
        <span className="text-xs text-scentia-muted">
          {total} imagen{total !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition text-center ${
          dragOver
            ? "border-scentia-gold bg-scentia-gold/5"
            : "border-scentia-border hover:border-scentia-gold"
        }`}
      >
        <Upload className="mx-auto mb-2 text-scentia-muted" size={28} />
        <p className="text-sm text-scentia-muted">
          Arrastra una o varias imágenes, o haz clic para seleccionar
        </p>
        <p className="text-xs text-scentia-muted mt-1">
          JPG, PNG, WEBP, AVIF, GIF · Máx 5MB c/u · Múltiples
        </p>
      </div>

      {localError && (
        <p className="text-red-400 text-xs mt-2">{localError}</p>
      )}

      {/* Input oculto — NOTA: multiple está aquí */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Galería */}
      {total > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          {/* Existentes (ya en BD) */}
          {existing.map((img) => (
            <div key={`existing-${img.id}`} className="relative group aspect-square">
              <img
                src={imageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover rounded-lg border border-scentia-border"
              />
              {coverUrl === img.url && (
                <span className="absolute top-1 left-1 bg-scentia-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                  COVER
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                {coverUrl !== img.url && (
                  <button
                    type="button"
                    onClick={() => onSetCover(img.url)}
                    className="p-1.5 rounded-full bg-scentia-gold text-black"
                    title="Marcar como cover"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.id)}
                  className="p-1.5 rounded-full bg-red-500 text-white"
                  title="Eliminar"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Nuevas (locales, aún no subidas) */}
          {newFiles.map((file, i) => (
            <div key={`new-${i}-${file.name}`} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-full object-cover rounded-lg border border-scentia-gold/40"
              />
              <span className="absolute top-1 left-1 bg-scentia-gold-soft text-black text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                NUEVA
              </span>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const next = newFiles.filter((_, idx) => idx !== i);
                    onChange(next);
                  }}
                  className="p-1.5 rounded-full bg-red-500 text-white"
                  title="Quitar"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}