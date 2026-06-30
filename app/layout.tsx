import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
    default: `${SITE.name} — погода в Мурманске и области`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["погода Мурманск", "погода Мурманская область", "прогноз погоды Заполярье", "yr.no", "MET Norway"],
  authors: [{ name: SITE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} — погода в Мурманске и области`,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — погода в Мурманске и области`,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
