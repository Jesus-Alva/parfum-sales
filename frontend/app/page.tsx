import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import PerfumeShowcase from "@/components/landing/PerfumeShowcase";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/shared/Navbar";
import LandingAtmosphere from "@/components/landing/LandingAtmosphere";
import {
  SITE_DESCRIPTION,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Perfumes de alta gama y fragancias de diseñador",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_MX",
    url: SITE_URL,
    title: "Perfumes de alta gama y fragancias de diseñador | ScentiA",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_LOGO_URL,
        width: 658,
        height: 379,
        alt: "ScentiA, perfumería de alta gama",
      },
    ],
  },
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: SITE_LOGO_URL,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "es-MX",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <main className="overflow-x-hidden">
        <Navbar />
        <Hero />
        <div className="landing-atmosphere">
          <LandingAtmosphere />
          <div className="relative z-10">
            <PerfumeShowcase />
            <Features />
            <Testimonials />
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
