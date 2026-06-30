import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  webpack(config, { isServer }) {
    if (!isServer) {
      /* Next.js встраивает polyfill-module.js (Array.prototype.at, flat, fromEntries, hasOwn, trimEnd/trimStart)
         в каждый клиентский бандл ~14 KiB. Аудитория сайта — современные браузеры (2022+), полифиллы не нужны. */
      config.resolve.alias["next/dist/build/polyfills/polyfill-module"] =
        path.join(__dirname, "src/shared/lib/empty-polyfill.js");
    }
    return config;
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
