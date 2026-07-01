import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";

/*
  PWA-манифест: делает сайт устанавливаемым (add to home screen). Next сам
  внедряет <link rel="manifest">. Иконка — существующий app/icon.svg (Chrome
  принимает SVG с sizes "any"). Оффлайн-режим (service worker) — отдельная
  задача, здесь только установка.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b5cad",
    lang: "ru",
    categories: ["weather"],
    icons: [
      { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
