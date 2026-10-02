"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, PackageSearch } from "lucide-react";
import { getToken, clearToken, isAdmin } from "@/lib/auth";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/#showcase", label: "Colección" },
  { href: "/#features", label: "Nosotros" },
  { href: "/#testimonials", label: "Opiniones" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdminState, setIsAdminState] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navRevealed, setNavRevealed] = useState(false);

  const cartCount = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0)
  );

  // Detectar auth y scroll
  useEffect(() => {
    setIsAuthed(!!getToken());
    setIsAdminState(isAdmin());
    const handleScroll = () => {
      const hasScrolled = window.scrollY > 30;
      setScrolled(hasScrolled);
      if (hasScrolled) setNavRevealed(false);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
    setNavRevealed(false);
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    setIsAuthed(false);
    router.push("/");
  };

  const isLanding = pathname === "/";
  const hideAtTop = isLanding && !scrolled && !mobileOpen && !navRevealed;

  return (
    <>
      {hideAtTop && (
        <button
          type="button"
          aria-label="Mostrar navegación"
          title="Mostrar navegación"
          onMouseEnter={() => setNavRevealed(true)}
          onFocus={() => setNavRevealed(true)}
          onClick={() => setNavRevealed(true)}
          className="fixed inset-x-0 top-0 z-[10000] flex h-4 items-start justify-center group"
        >
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-1 h-1 w-10 rounded-full bg-scentia-gold/70 shadow-[0_0_12px_rgba(212,175,55,0.45)] transition-all duration-300 group-hover:w-16 group-hover:bg-scentia-gold"
          />
          <span className="sr-only">Mostrar navegación</span>
        </button>
      )}
      <motion.nav
        initial={false}
        animate={{ y: hideAtTop ? -100 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onMouseEnter={() => {
          if (isLanding && !scrolled) setNavRevealed(true);
        }}
        onMouseLeave={() => {
          if (isLanding && !scrolled && !mobileOpen) setNavRevealed(false);
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[9999] transition-all duration-300",
          scrolled || isLanding
            ? "bg-scentia-bg/50 backdrop-blur-xl border-b border-scentia-border/60 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative group">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="font-display text-2xl md:text-3xl text-gradient-gold block"
            >
              Scentia
            </motion.span>
            <motion.span
              className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-scentia-gold to-transparent"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </Link>

          {/* Links desktop */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-scentia-text/80 hover:text-scentia-gold transition relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-scentia-gold group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Carrito (solo si auth) */}
            {isAuthed && (
              <Link
                href="/carrito"
                className="relative p-2 rounded-full hover:bg-white/5 transition"
                title="Carrito de compras"
              >
                <ShoppingBag size={18} className="text-scentia-text" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-scentia-gold text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthed ? (
              <>
                <Link
                  href="/mis-pedidos"
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-scentia-gold/40 text-scentia-gold text-sm hover:bg-scentia-gold/10 transition"
                  title="Mis pedidos"
                >
                  <PackageSearch size={15} />
                  Mis pedidos
                </Link>
                {isAdminState && (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-scentia-gold/40 text-scentia-gold text-sm hover:bg-scentia-gold/10 transition"
                    >
                      <LayoutDashboard size={14} />
                      Panel
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-500/10 text-scentia-muted hover:text-red-400 transition"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-scentia-text/80 hover:text-scentia-gold transition px-3"
                >
                  <User size={15} />
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="relative overflow-hidden bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black text-sm font-semibold px-5 py-2 rounded-full group"
                >
                  <span className="relative z-10">Crear cuenta</span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </Link>
              </>
            )}
          </div>

          {/* Botón móvil */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X size={22} className="text-scentia-gold" />
            ) : (
              <Menu size={22} className="text-scentia-text" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-scentia-card border-l border-scentia-border z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-scentia-border">
                <span className="font-display text-2xl text-gradient-gold">Scentia</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="flex-1 py-6 px-6 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-3 text-lg text-scentia-text/90 hover:text-scentia-gold transition"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="p-6 border-t border-scentia-border space-y-3">
                {isAuthed ? (
                  <>
                    <Link href="/mis-pedidos" className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-scentia-gold/40 text-scentia-gold font-semibold"><PackageSearch size={16} />Mis pedidos</Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold"
                    >
                      <LayoutDashboard size={16} />
                      Ir al panel
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-scentia-gold/40 text-scentia-gold"
                    >
                      <User size={16} />
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center w-full py-3 rounded-full bg-gradient-to-r from-scentia-gold to-scentia-gold-soft text-black font-semibold"
                    >
                      Crear cuenta
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
