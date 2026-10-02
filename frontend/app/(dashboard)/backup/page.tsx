"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Download, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api";
import { getToken, isAdmin } from "@/lib/auth";

export default function BackupPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else if (!isAdmin()) router.replace("/dashboard");
    else setAuthorized(true);
    setChecking(false);
  }, [router]);

  const downloadBackup = async () => {
    setDownloading(true);
    setError("");
    try {
      const { data } = await api.get("/backups/database", { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scentia-backup-${new Date().toISOString().slice(0, 10)}.dump`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("No se pudo generar el respaldo. Intenta nuevamente.");
    } finally {
      setDownloading(false);
    }
  };

  if (checking || !authorized) return null;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-scentia-muted">Administración</p>
        <h1 className="font-display text-3xl text-gradient-gold">Respaldo de base de datos</h1>
      </header>
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-scentia-gold/30 bg-scentia-gold/10 text-scentia-gold">
          <Database size={22} />
        </div>
        <h2 className="font-display text-xl">Descargar respaldo completo</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-scentia-muted">
          Genera una copia de la base de datos actual y guárdala en un lugar seguro. El archivo se descarga en formato PostgreSQL y puede restaurarse con las herramientas de PostgreSQL.
        </p>
        {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button
          type="button"
          onClick={downloadBackup}
          disabled={downloading}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {downloading ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />}
          {downloading ? "Generando respaldo…" : "Descargar respaldo"}
        </button>
      </div>
    </section>
  );
}
