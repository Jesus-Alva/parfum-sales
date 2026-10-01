import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que SOLO admins pueden ver
const ADMIN_PATTERNS = [
  /^\/dashboard(\/|$)/,
  /^\/analytics(\/|$)/,
  /^\/sales(\/|$)/,
  /^\/orders(\/|$)/,
  /^\/delivery-locations(\/|$)/,
  /^\/perfumes\/?$/,              // solo la lista del panel
  /^\/perfumes\/new(\/|$)/,
  /^\/perfumes\/\d+\/edit(\/|$)/,
];

// Rutas públicas que NO deben verse si ya estás logueado
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("scentia_token")?.value;
  const isAdminCookie = request.cookies.get("scentia_is_admin")?.value === "1";

  const isAdminRoute = ADMIN_PATTERNS.some((rx) => rx.test(pathname));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // 1. Ruta de admin SIN login → al login con next
  if (isAdminRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Ruta de admin CON login pero SIN rol admin → al landing
  if (isAdminRoute && token && !isAdminCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("forbidden", "1");   // aviso opcional
    return NextResponse.redirect(url);
  }

  // 3. Login/registro estando logueado → redirige según rol
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminCookie ? "/dashboard" : "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
