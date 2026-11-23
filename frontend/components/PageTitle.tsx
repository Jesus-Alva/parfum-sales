"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Perfumes de alta gama y fragancias de diseñador",
  "/catalogo": "Catálogo de perfumes",
  "/carrito": "Carrito de compras",
  "/mis-pedidos": "Mis pedidos",
  "/perfil": "Mi perfil",
  "/login": "Iniciar sesión",
  "/register": "Crear cuenta",
  "/recuperar-contrasena": "Recuperar contraseña",
  "/restablecer-contrasena": "Restablecer contraseña",
  "/dashboard": "Panel de administración",
  "/perfumes": "Administrar perfumes",
  "/perfumes/new": "Registrar perfume",
  "/decanters": "Administrar decanters",
  "/decanters/new": "Registrar decanter",
  "/delivery-locations": "Puntos de entrega",
  "/orders": "Pedidos",
  "/sales": "Ventas",
  "/brands": "Marcas",
  "/users": "Usuarios",
  "/analytics": "Analítica",
  "/backup": "Copias de seguridad",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (/^\/perfumes\/[^/]+\/edit$/.test(pathname)) return "Editar perfume";
  if (/^\/perfumes\/[^/]+$/.test(pathname)) return "Detalle del perfume";
  if (/^\/decanters\/[^/]+\/edit$/.test(pathname)) return "Editar decanter";
  if (/^\/sales\/[^/]+$/.test(pathname)) return "Detalle de venta";
  return "Perfumes de alta gama";
}

export default function PageTitle() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = `ScentiA | ${getPageTitle(pathname)}`;
  }, [pathname]);

  return null;
}
