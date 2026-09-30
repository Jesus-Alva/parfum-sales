"use client";
import { useRef, useState } from "react";
import { Upload, X, Star } from "lucide-react";
import { imageUrl } from "@/lib/api";

type Props = {
  // imágenes existentes (ya guardadas)
  existing: { id: number; url: string }[];
  // archivos nuevos (aún no subidos)
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

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });
    onChange([...newFiles, ...arr]);
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
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
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
          Arrastra imágenes o haz clic para seleccionar
        </p>
        <p className="text-xs text-scentia-muted mt-1">
          JPG, PNG, WEBP · Máx 5MB c/u · Múltiples
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Galería de previews */}
      {total > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          {/* Imágenes existentes (ya en BD) */}
          {existing.map((img) => (
            <div key={img.id} className="relative group aspect-square">
              <img
                src={imageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover rounded-lg border border-scentia-border"
              />
              {coverUrl === img.url && (
                <span className="absolute top-1 left-1 bg-scentia-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                  COVER
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onSetCover(img.url)}
                  className="p-1.5 rounded-full bg-scentia-gold text-black"
                  title="Marcar como cover"
                >
                  <Star size={12} />
                </button>
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

          {/* Archivos nuevos (locales) */}
          {newFiles.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={i} className="relative group aspect-square">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-scentia-gold/40"
                />
                <span className="absolute top-1 left-1 bg-scentia-gold-soft text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                  NUEVA
                </span>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(newFiles.filter((_, idx) => idx !== i));
                    }}
                    className="p-1.5 rounded-full bg-red-500 text-white"
                    title="Quitar"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}