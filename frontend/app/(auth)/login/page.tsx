"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error de login");
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
        transition={{ duration: 0.6 }}
        onSubmit={submit}
        className="glass rounded-2xl p-8 w-full max-w-md relative z-10"
      >
        <h1 className="font-display text-3xl mb-1 text-gradient-gold">Scentia</h1>
        <p className="text-scentia-muted text-sm mb-6">Inicia sesión</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-scentia-card border border-scentia-border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-scentia-gold"
        />

        <label className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-scentia-card border border-scentia-border rounded-lg px-4 py-2 mb-6 focus:outline-none focus:border-scentia-gold"
        />

        <button
          disabled={loading}
          className="w-full bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-xs text-scentia-muted mt-4 text-center">
          ¿No tienes cuenta? <a href="/register" className="text-scentia-gold">Regístrate</a>
        </p>
      </motion.form>
    </div>
  );
}