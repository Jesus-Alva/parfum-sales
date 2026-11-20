"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, SprayCan, ShoppingBag, BarChart3, MapPin, PackageSearch, Database, Tags, Users, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdmin as isAdminFn } from "@/lib/auth";

const ALL_ITEMS = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, adminOnly: false },
  { href: "/perfumes", label: "Perfumes", icon: SprayCan, adminOnly: true },
  { href: "/decanters", label: "Decanters", icon: Droplets, adminOnly: true },
  { href: "/brands", label: "Marcas", icon: Tags, adminOnly: true },
  { href: "/users", label: "Usuarios", icon: Users, adminOnly: true },
  { href: "/sales", label: "Ventas", icon: ShoppingBag, adminOnly: true },
  { href: "/orders", label: "Pedidos", icon: PackageSearch, adminOnly: true },
  { href: "/delivery-locations", label: "Ubicaciones", icon: MapPin, adminOnly: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
  { href: "/backup", label: "Respaldo BD", icon: Database, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdminFn());
  }, []);

  const items = ALL_ITEMS.filter((i) => !i.adminOnly || admin);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-scentia-card border-r border-scentia-border min-h-screen p-6">
      <Link href="/" aria-label="ScentiA" className="mb-10 flex items-center gap-2">
        <Image src="/images/brand/icon.png" alt="" width={34} height={35} className="h-9 w-9 object-contain" />
        <Image src="/images/brand/wordmark.png" alt="ScentiA" width={658} height={154} className="h-8 w-[142px] object-contain" />
      </Link>
      <nav className="space-y-1">
        {items.map((i) => {
          const active = pathname === i.href || pathname?.startsWith(i.href + "/");
          return (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                active
                  ? "bg-scentia-gold/10 text-scentia-gold border border-scentia-gold/30"
                  : "text-scentia-muted hover:text-scentia-text hover:bg-white/5"
              )}
            >
              <i.icon size={18} />
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
