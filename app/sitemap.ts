import type { MetadataRoute } from "next";
import { getAllCities } from "@/entities/city/lib/registry";
import { SITE } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE.url, lastModified: now, changeFrequency: "hourly", priority: 1 },
    ...getAllCities().map((c) => ({
      url: `${SITE.url}/${c.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: c.slug === "murmansk" ? 0.9 : 0.7,
    })),
  ];
}
