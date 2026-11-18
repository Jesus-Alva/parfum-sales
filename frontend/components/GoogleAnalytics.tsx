// components/GoogleAnalytics.tsx
import Script from 'next/script';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-RJ644NKB68";

export default function GoogleAnalytics() {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            cookie_domain: 'none', // Crucial para localhost
            debug_mode: ${process.env.NODE_ENV === 'development'} // Activa DebugView en dev
          });
        `}
      </Script>
    </>
  );
}