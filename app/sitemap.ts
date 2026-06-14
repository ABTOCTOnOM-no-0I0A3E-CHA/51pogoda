import type { MetadataRoute } from "next";
import { CITIES } from "@/entities/city";
import { SITE } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE.url, lastModified: now, changeFrequency: "hourly", priority: 1 },
    ...CITIES.map((c) => ({
      url: `${SITE.url}/${c.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: c.slug === "murmansk" ? 0.9 : 0.7,
    })),
  ];
}
