import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas protegidas con regex (más preciso que prefijo)
const PROTECTED_PATTERNS = [
  /^\/dashboard(\/|$)/,
  /^\/analytics(\/|$)/,
  /^\/perfumes\/?$/,            // solo "/perfumes" y "/perfumes/"
  /^\/perfumes\/new(\/|$)/,     // "/perfumes/new"
  /^\/perfumes\/\d+\/edit(\/|$)/, // "/perfumes/123/edit"
  /^\/sales(\/|$)/,
];

// Rutas que NO deben verse si ya estás logueado
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("scentia_token")?.value;

  const isProtected = PROTECTED_PATTERNS.some((rx) => rx.test(pathname));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Sin token en ruta protegida → login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Con token en login/register → dashboard
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};