"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, SprayCan, ShoppingBag, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/perfumes", label: "Perfumes", icon: SprayCan },
  { href: "/sales", label: "Ventas", icon: ShoppingBag },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 bg-scentia-card border-r border-scentia-border min-h-screen p-6">
      <Link href="/" className="font-display text-3xl text-gradient-gold mb-10">
        Scentia
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