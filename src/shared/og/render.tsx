import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/*
  Рендер OG-картинок (1200×630) для next/og. Шрифт Inter — тот же, что в UI;
  статические TTF забандлены в src/shared/og и читаются с диска от cwd (работает
  и на пререндере, и в next start). Никакого рантайм-фетча с Google.
  NB: при output:"standalone" эти .ttf нужно докопировать вручную.
*/

export const OG_SIZE = { width: 1200, height: 630 };

type FontEntry = { name: "Inter"; data: Buffer; weight: 400 | 800; style: "normal" };

const FONT_DIR = join(process.cwd(), "src", "shared", "og");

let fontsCache: FontEntry[] | null = null;

function loadFonts(): FontEntry[] {
  if (fontsCache) return fontsCache;
  fontsCache = [
    { name: "Inter", data: readFileSync(join(FONT_DIR, "Inter-Regular.ttf")), weight: 400, style: "normal" },
    { name: "Inter", data: readFileSync(join(FONT_DIR, "Inter-ExtraBold.ttf")), weight: 800, style: "normal" },
  ];
  return fontsCache;
}

function titleSize(title: string): number {
  const n = title.length;
  if (n <= 10) return 104;
  if (n <= 18) return 82;
  if (n <= 28) return 62;
  return 48;
}

interface OgOpts {
  title: string;
  subtitle: string;
  tag?: string;
}

export function renderOg({ title, subtitle, tag }: OgOpts): ImageResponse {
  const fonts = loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b5cad 0%, #0a4f96 60%, #073d75 100%)",
          padding: "64px 72px",
          fontFamily: "Inter",
          color: "#ffffff",
        }}
      >
        {/* бренд */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24">
              <polygon points="12,3 21,12 12,21 3,12" fill="#0b5cad" />
              <circle cx="12" cy="12" r="2.6" fill="#ffffff" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>Погода Заполярья</div>
            <div style={{ fontSize: 20, opacity: 0.8 }}>Мурманск и область</div>
          </div>
        </div>

        {/* заголовок */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: titleSize(title), fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 32, opacity: 0.92 }}>{subtitle}</div>
        </div>

        {/* подвал */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24 }}>
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              textTransform: "capitalize",
            }}
          >
            {tag ?? "Прогноз погоды"}
          </div>
          <div style={{ display: "flex", opacity: 0.85 }}>MET Norway · yr.no</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
