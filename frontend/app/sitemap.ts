import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

type PublicPerfume = { id: number | string; is_enabled?: boolean };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: "daily", priority: 0.9 },
  ];

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiBase) return entries;

  try {
    const response = await fetch(`${apiBase}/perfumes/`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return entries;

    const perfumes = (await response.json()) as PublicPerfume[];
    if (!Array.isArray(perfumes)) return entries;

    for (const perfume of perfumes) {
      if (perfume?.id == null || perfume.is_enabled === false) continue;
      entries.push({
        url: `${SITE_URL}/perfumes/${encodeURIComponent(String(perfume.id))}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Keep the public landing and catalog available even if the API is offline.
  }

  return entries;
}
