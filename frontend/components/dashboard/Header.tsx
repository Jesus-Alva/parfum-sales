"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearToken, isAdmin } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(false);
  const navLinks = [
    ["/dashboard", "Panel"],
    ["/perfumes", "Perfumes"],
    ["/orders", "Pedidos"],
    ["/delivery-locations", "Ubicaciones"],
    ["/sales", "Ventas"],
    ["/analytics", "Analytics"],
    ...(admin ? [["/backup", "Respaldo BD"]] : []),
  ];

  useEffect(() => { setAdmin(isAdmin()); }, []);
  const logout = () => {
    clearToken();
    router.push("/login");
  };
  return (
    <header className="border-b border-scentia-border bg-scentia-card/50 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Bienvenido</h2>
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
