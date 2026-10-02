"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Download, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { getToken, isAdmin } from "@/lib/auth";

type Backup = {
  filename: string;
  size: number;
  created_at: string;
  is_safety_backup: boolean;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BackupPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeBackup, setActiveBackup] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refreshBackups = useCallback(async () => {
    const { data } = await api.get<Backup[]>("/backups");
    setBackups(data);
  }, []);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else if (!isAdmin()) router.replace("/dashboard");
    else {
      setAuthorized(true);
      refreshBackups().catch(() => setError("No se pudo leer la carpeta de respaldos."))
        .finally(() => setLoadingList(false));
    }
    setChecking(false);
  }, [refreshBackups, router]);

  const createBackup = async () => {
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const { data, headers } = await api.get<Blob>("/backups/database", { responseType: "blob" });
      const disposition = headers["content-disposition"] as string | undefined;
      const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] || `scentia-backup-${Date.now()}.dump`;
      downloadBlob(data, filename);
      await refreshBackups();
      setMessage("Se guardó el respaldo en la carpeta backups y comenzó la descarga.");
    } catch {
      setError("No se pudo generar el respaldo. Intenta nuevamente.");
    } finally {
      setCreating(false);
      setLoadingList(false);
    }
  };

  const exportBackup = async (backup: Backup) => {
    setActiveBackup(backup.filename);
    setError("");
    setMessage("");
    try {
      const { data } = await api.get<Blob>(`/backups/files/${encodeURIComponent(backup.filename)}`, { responseType: "blob" });
      downloadBlob(data, backup.filename);
    } catch {
      setError(`No se pudo exportar ${backup.filename}.`);
    } finally {
      setActiveBackup("");
    }
  };

  const restoreBackup = async (backup: Backup) => {
    const confirmed = window.confirm(
      `Se restaurará ${backup.filename} y se reemplazarán los datos actuales. ¿Deseas continuar?`,
    );
    if (!confirmed) return;
    setActiveBackup(backup.filename);
    setError("");
    setMessage("");
    try {
      await api.post(`/backups/restore/${encodeURIComponent(backup.filename)}`);
      await refreshBackups();
      setMessage(`Se restauró la base de datos con ${backup.filename}.`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || `No se pudo restaurar ${backup.filename}.`);
      await refreshBackups().catch(() => undefined);
    } finally {
      setActiveBackup("");
      setLoadingList(false);
    }
  };

  const deleteBackup = async (backup: Backup) => {
    if (!window.confirm(`¿Eliminar definitivamente el respaldo ${backup.filename}?`)) return;
    setActiveBackup(backup.filename);
    setError("");
    setMessage("");
    try {
      await api.delete(`/backups/files/${encodeURIComponent(backup.filename)}`);
      await refreshBackups();
      setMessage(`Se eliminó el respaldo ${backup.filename}.`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || `No se pudo eliminar ${backup.filename}.`);
    } finally {
      setActiveBackup("");
      setLoadingList(false);
    }
  };

  if (checking || !authorized) return null;

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-scentia-muted">Administración</p>
        <h1 className="font-display text-3xl text-gradient-gold">Respaldo de base de datos</h1>
      </header>

      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-scentia-gold/30 bg-scentia-gold/10 text-scentia-gold"><Database size={22} /></div>
        <h2 className="font-display text-xl">Crear un respaldo</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-scentia-muted">La copia se guardará en la carpeta <code>backups</code> del proyecto y también se descargará en tu equipo.</p>
        <button type="button" onClick={createBackup} disabled={creating} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
          {creating ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />}
          {creating ? "Generando respaldo…" : "Crear y descargar respaldo"}
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</p>}

      <section className="glass rounded-2xl p-5 md:p-6">
        <div className="mb-4"><h2 className="font-display text-xl">Respaldos disponibles</h2><p className="mt-1 text-sm text-scentia-muted">Puedes exportar una copia o restaurarla en la base de datos actual.</p></div>
        {loadingList ? <p className="py-6 text-center text-sm text-scentia-muted">Leyendo carpeta de respaldos…</p> : backups.length === 0 ? <p className="rounded-lg border border-scentia-border p-6 text-center text-sm text-scentia-muted">No hay archivos de respaldo en la carpeta.</p> : (
          <div className="space-y-3">
            {backups.map((backup) => {
              const busy = activeBackup === backup.filename;
              return (
                <article key={backup.filename} className="flex flex-col gap-4 rounded-xl border border-scentia-border bg-scentia-card/40 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm text-scentia-gold">{backup.filename}</p>
                    <p className="mt-1 text-xs text-scentia-muted">{new Date(backup.created_at).toLocaleString("es-MX")} · {formatSize(backup.size)}{backup.is_safety_backup ? " · Respaldo de seguridad" : ""}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={() => exportBackup(backup)} disabled={Boolean(activeBackup) || creating} className="inline-flex items-center gap-2 rounded-lg border border-scentia-gold/40 px-3 py-2 text-xs font-medium text-scentia-gold transition hover:bg-scentia-gold/10 disabled:opacity-50">
                      {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />} Exportar
                    </button>
                    <button type="button" onClick={() => restoreBackup(backup)} disabled={Boolean(activeBackup) || creating} className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-400/10 disabled:opacity-50">
                      <RotateCcw size={14} /> Restaurar
                    </button>
                    <button type="button" onClick={() => deleteBackup(backup)} disabled={Boolean(activeBackup) || creating} className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-50" aria-label={`Eliminar ${backup.filename}`}>
                      {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />} Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
