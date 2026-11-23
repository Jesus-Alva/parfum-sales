import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/users",
        "/brands",
        "/orders",
        "/sales",
        "/analytics",
        "/backup",
        "/delivery-locations",
        "/decanters",
        "/perfumes/new",
        "/perfumes/*/edit",
        "/carrito",
        "/mis-pedidos",
        "/perfil",
        "/login",
        "/register",
        "/recuperar-contrasena",
        "/restablecer-contrasena",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
