import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/widgets/site-header";
import { SITE } from "@/shared/config/site";
import "@/app/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `Норвежский сайт погоды — ${SITE.name}: погода в Мурманске и области`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["погода Мурманск", "норвежский сайт погоды", "погода Мурманская область", "прогноз погоды Заполярье", "yr.no", "MET Norway"],
  icons: {
    apple: "/icon.svg",
  },
  authors: [{ name: SITE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: `Норвежский сайт погоды — ${SITE.name}: погода в Мурманске и области`,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Норвежский сайт погоды — ${SITE.name}: погода в Мурманске и области`,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    yandex: "5da092ec326088b0",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b5cad",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://www.windy.com" />
        <link rel="dns-prefetch" href="https://www.windy.com" />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>

        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');

            ym(110283298,'init',{
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true
            });
          `}
        </Script>
        <noscript>
          <div>
            {/* next/image не работает внутри <noscript> — трекинг-пиксель Я.Метрики */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://mc.yandex.ru/watch/110283298" style={{ position: "absolute", left: -9999 }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}
