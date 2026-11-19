"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { clearToken, getToken, isAdmin } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const navLinks = [
    ["/dashboard", "Panel"],
    ["/perfumes", "Perfumes"],
    ["/orders", "Pedidos"],
    ["/delivery-locations", "Ubicaciones"],
    ["/sales", "Ventas"],
    ["/analytics", "Analytics"],
    ...(admin ? [["/backup", "Respaldo BD"]] : []),
  ];

  useEffect(() => {
    const syncUser = () => {
      setAdmin(isAdmin());
      const token = getToken();
      setUserName(localStorage.getItem("scentia_full_name") || "");
      if (token) api.get("/users/me").then(({ data }) => {
        if (getToken() !== token) return;
        setUserName(data.full_name || "");
        localStorage.setItem("scentia_full_name", data.full_name || "");
      }).catch(() => undefined);
    };
    syncUser();
    window.addEventListener("scentia:auth-change", syncUser);
    return () => window.removeEventListener("scentia:auth-change", syncUser);
  }, []);
  const logout = () => {
    clearToken();
    router.push("/login");
  };
  return (
    <header className="border-b border-scentia-border bg-scentia-card/50 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-xl">Bienvenido{userName ? `, ${userName}` : ""}</h2><Link href="/perfil" className="mt-1 inline-flex items-center gap-1.5 text-xs text-scentia-muted transition hover:text-scentia-gold"><UserRound size={13} /> Mi perfil</Link></div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-scentia-muted transition hover:text-scentia-gold"><LogOut size={16} /> Salir</button>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden" aria-label="Navegación del panel">
        {navLinks.map(([href, label]) => (
          <Link key={href} href={href} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${pathname === href || pathname?.startsWith(`${href}/`) ? "border-scentia-gold/40 bg-scentia-gold/10 text-scentia-gold" : "border-scentia-border text-scentia-muted"}`}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
