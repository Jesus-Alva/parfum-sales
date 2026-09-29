"use client";
import Link from "next/link";

export default function SaleTable({ sales }: { sales: any[] }) {
  if (!sales.length) return <p className="text-scentia-muted">Sin ventas registradas.</p>;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-scentia-card/60 text-scentia-muted">
          <tr>
            <th className="text-left p-3">Folio</th>
            <th className="text-left p-3">Comprador</th>
            <th className="text-left p-3">Total</th>
            <th className="text-left p-3">Estado</th>
            <th className="text-left p-3">Fecha</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-t border-scentia-border hover:bg-white/5 transition">
              <td className="p-3 font-mono text-scentia-gold">{s.folio}</td>
              <td className="p-3">{s.buyer_name}</td>
              <td className="p-3">${s.total.toFixed(2)}</td>
              <td className="p-3">
                <span className="px-2 py-1 rounded-full text-xs bg-scentia-gold/10 text-scentia-gold border border-scentia-gold/30">
                  {s.status}
                </span>
              </td>
              <td className="p-3 text-scentia-muted">
                {new Date(s.created_at).toLocaleString()}
              </td>
              <td className="p-3 text-right">
                <Link href={`/sales/${s.id}`} className="text-scentia-gold hover:underline">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}