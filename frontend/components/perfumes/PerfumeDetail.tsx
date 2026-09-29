"use client";

export default function PerfumeDetail({ perfume }: { perfume: any }) {
  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-scentia-gold mb-2">{perfume.brand}</p>
      <h1 className="font-display text-4xl mb-4">{perfume.name}</h1>
      <p className="text-scentia-muted mb-6">{perfume.description}</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-scentia-muted">Género:</span> {perfume.gender}</div>
        <div><span className="text-scentia-muted">Familia:</span> {perfume.family}</div>
        <div><span className="text-scentia-muted">Volumen:</span> {perfume.volume_ml} ml</div>
        <div><span className="text-scentia-muted">Stock:</span> {perfume.stock}</div>
        <div><span className="text-scentia-muted">Precio:</span> ${perfume.price}</div>
      </div>
    </div>
  );
}