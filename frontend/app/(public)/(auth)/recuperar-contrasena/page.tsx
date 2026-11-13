"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/password/forgot", { email });
      setMessage(data.message);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo solicitar el enlace. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-radial-gold opacity-40 pointer-events-none" />
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="glass rounded-2xl p-8 w-full max-w-md relative z-10"
      >
        <h1 className="font-display text-3xl mb-1 text-gradient-gold">Recuperar contraseña</h1>
        <p className="text-scentia-muted text-sm mb-6">
          Escribe el correo de tu cuenta y te enviaremos un enlace para cambiarla.
        </p>

        {error && <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}
        {message && <div role="status" className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm rounded-lg p-3 mb-4">{message}</div>}

        <label htmlFor="recovery-email" className="block text-sm mb-1">Email</label>
        <input
          id="recovery-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="w-full bg-scentia-card border border-scentia-border rounded-lg px-4 py-2 mb-6 focus:outline-none focus:border-scentia-gold"
        />

        <button
          disabled={loading}
          className="w-full bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
        <p className="text-sm text-center mt-5">
          <Link href="/login" className="text-scentia-gold hover:underline">Volver al inicio de sesión</Link>
        </p>
      </motion.form>
    </div>
  );
}
