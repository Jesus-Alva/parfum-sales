"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearToken } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const logout = () => {
    clearToken();
    router.push("/login");
  };
  return (
    <header className="border-b border-scentia-border px-6 py-4 flex items-center justify-between bg-scentia-card/50 backdrop-blur">
      <h2 className="font-display text-xl">Bienvenido</h2>
      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm text-scentia-muted hover:text-scentia-gold transition"
      >
        <LogOut size={16} /> Salir
      </button>
    </header>
  );
}