// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAnalyticsPageTracker from "@/components/GoogleAnalyticsPageTracker";
import PageTitle from "@/components/PageTitle";
import WelcomeSplash from "@/components/shared/WelcomeSplash";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ScentiA | Perfumes de alta gama y fragancias exclusivas",
    template: "ScentiA | %s",
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_MX",
    title: "ScentiA | Perfumes de alta gama y fragancias exclusivas",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/brand/logo-complete.png",
        width: 658,
        height: 379,
        alt: "ScentiA, perfumería de alta gama",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScentiA | Perfumes de alta gama y fragancias exclusivas",
    description: SITE_DESCRIPTION,
    images: ["/images/brand/logo-complete.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-scentia-bg text-scentia-text antialiased">
        {/* Scripts al final del body para asegurar SSR */}
        <GoogleAnalytics />
        <PageTitle />
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
