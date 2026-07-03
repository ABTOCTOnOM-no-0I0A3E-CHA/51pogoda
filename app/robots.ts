import type { MetadataRoute } from "next";
import { SITE, NOINDEX } from "@/shared/config/site";

export default function robots(): MetadataRoute.Robots {
  if (NOINDEX) {
    /* Dev: полностью запретить индексацию всему сайту */
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
