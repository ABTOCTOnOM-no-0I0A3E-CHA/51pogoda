import { SITE } from "@/shared/config/site";
import { hhmm } from "@/shared/lib/format";

export function SiteFooter({ marginTop = 40 }: { marginTop?: number }) {
  const updated = hhmm(new Date());

  return (
    <footer
      style={{
        marginTop,
        paddingTop: 20,
        borderTop: "1px solid #dfe5ec",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 13,
        color: "#8a98a6",
      }}
    >
      <p style={{ margin: 0, lineHeight: 1.5 }}>
        {SITE.name} — норвежский сайт погоды по данным{" "}
        <a href="https://www.yr.no" target="_blank" rel="noopener noreferrer" style={{ color: "#8a98a6" }}>
          MET Norway (yr.no)
        </a>
        . Прогноз для Мурманска и Мурманской области: температура воздуха, скорость ветра,
        атмосферное давление, осадки. Метеограмма на 2 суток и прогноз на 10 дней
        от норвежского метеорологического института.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span>{SITE.name} · © {SITE.copyrightYear}</span>
        <span>обновлено {updated}</span>
      </div>
    </footer>
  );
}
