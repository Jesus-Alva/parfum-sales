// Public GTM container ID; the environment variable can override it per deployment.
const containerId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-P8VRK9PT";

export default function GoogleTagManager() {
  if (!containerId || !/^GTM-[A-Z0-9]+$/.test(containerId)) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtm.js?id=${containerId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: "window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date());",
        }}
      />
    </>
  );
}
