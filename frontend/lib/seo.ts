export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://frontend-production-b0d1ffa5.up.railway.app"
).replace(/\/$/, "");

export const SITE_NAME = "ScentiA";

export const SITE_DESCRIPTION =
  "Descubre perfumes de alta gama y fragancias de diseñador en ScentiA. Explora marcas exclusivas y encuentra tu esencia ideal para cada ocasión.";

export const SITE_LOGO_URL = `${SITE_URL}/images/brand/logo-complete.png`;
