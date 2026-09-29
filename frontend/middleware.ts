import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que SOLO funcionan logueado
const PROTECTED_ROUTES = ["/dashboard", "/perfumes", "/sales", "/analytics"];

// Rutas que NO deben verse si ya estás logueado
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Como usamos localStorage, no podemos leer el token aquí.
  // Usamos una cookie espejo que seteamos desde el login.
  const token = request.cookies.get("scentia_token")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Sin token → redirige al login si intenta entrar a una ruta protegida
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Con token → si va a login/register, mándalo al dashboard
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (our images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};