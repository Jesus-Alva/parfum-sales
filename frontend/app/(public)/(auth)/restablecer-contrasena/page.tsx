"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/password/reset", { token, new_password: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo cambiar la contraseña. Solicita un enlace nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="glass rounded-2xl p-8 w-full max-w-md relative z-10"
    >
      <h1 className="font-display text-3xl mb-1 text-gradient-gold">Nueva contraseña</h1>
      <p className="text-scentia-muted text-sm mb-6">Elige una contraseña de al menos 8 caracteres.</p>

      {error && <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {!token ? (
        <div className="text-sm text-scentia-muted">
          El enlace no contiene un token válido. <Link href="/recuperar-contrasena" className="text-scentia-gold hover:underline">Solicita otro</Link>.
        </div>
      ) : success ? (
        <div role="status" className="text-sm text-emerald-200">
          Tu contraseña se actualizó. <Link href="/login" className="text-scentia-gold hover:underline">Inicia sesión</Link>.
        </div>
      ) : (
        <>
          <label htmlFor="new-password" className="block text-sm mb-1">Nueva contraseña</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            className="w-full bg-scentia-card border border-scentia-border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-scentia-gold"
          />
          <label htmlFor="confirm-password" className="block text-sm mb-1">Confirma la contraseña</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            className="w-full bg-scentia-card border border-scentia-border rounded-lg px-4 py-2 mb-6 focus:outline-none focus:border-scentia-gold"
          />
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </>
      )}
    </motion.form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-radial-gold opacity-40 pointer-events-none" />
      <Suspense fallback={<div className="glass rounded-2xl p-8 w-full max-w-md relative z-10 text-center text-scentia-muted">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
