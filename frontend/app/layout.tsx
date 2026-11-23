// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAnalyticsPageTracker from "@/components/GoogleAnalyticsPageTracker";
import WelcomeSplash from "@/components/shared/WelcomeSplash";

export const metadata: Metadata = {
  title: "Scentia | Perfumes de Alta Gama",
  description: "Descubre fragancias exclusivas. Registra tu compra en segundos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-scentia-bg text-scentia-text antialiased">
        {/* Scripts al final del body para asegurar SSR */}
        <GoogleAnalytics />
        {/* Este componente debe enviar el page_view en cada cambio de ruta */}
        <Suspense fallback={null}>
          <GoogleAnalyticsPageTracker />
        </Suspense>
        <WelcomeSplash />
        {children}
      </body>
    </html>
  );
}
