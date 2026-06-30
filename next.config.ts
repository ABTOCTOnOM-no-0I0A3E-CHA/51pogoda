import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /* Next.js встраивает polyfill-module.js (~14 KiB) в каждый клиентский бандл.
     Аудитория сайта — современные браузеры (2022+) — полифиллы не нужны.
     Turbopack (дефолт Next 16) не умеет webpack alias — используем его resolveAlias. */
  turbopack: {
    resolveAlias: {
      "next/dist/build/polyfills/polyfill-module":
        path.join(__dirname, "src/shared/lib/empty-polyfill.js"),
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
