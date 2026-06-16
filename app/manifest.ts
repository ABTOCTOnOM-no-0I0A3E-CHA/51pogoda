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
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" }],
  };
}
