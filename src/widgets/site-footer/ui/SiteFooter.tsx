import Link from "next/link";
import { SITE } from "@/shared/config/site";
import { hhmm } from "@/shared/lib/format";
import { YandexRtbFeed } from "@/shared/ui";

export function SiteFooter({ marginTop = 40 }: { marginTop?: number }) {
  const updated = hhmm(new Date());

  return (
    <>
    {/* Лента РСЯ идёт под контентом, но над подвалом — там её видно */}
    <YandexRtbFeed />
    <footer
      style={{
        marginTop,
        paddingTop: 20,
        borderTop: "1px solid #dfe5ec",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 13,
        color: "#6d7f8e",
      }}
    >
      <p style={{ margin: 0, lineHeight: 1.5 }}>
        {SITE.name} — норвежский сайт погоды по данным{" "}
        <a href="https://www.yr.no" target="_blank" rel="noopener noreferrer" style={{ color: "#6d7f8e" }}>
          MET Norway (yr.no)
        </a>
        . Прогноз для Мурманска и Мурманской области: температура воздуха, скорость ветра,
        атмосферное давление, осадки. Метеограмма на 2 суток и прогноз на 10 дней
        от норвежского метеорологического института.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <span>{SITE.name} · © {SITE.copyrightYear}</span>
          <a href="mailto:contact@51pogoda.ru" style={{ color: "#6d7f8e", fontWeight: 600 }}>contact@51pogoda.ru</a>
          <Link href="/about" style={{ color: "#6d7f8e" }}>О проекте</Link>
          <Link href="/contacts" style={{ color: "#6d7f8e" }}>Контакты</Link>
          <Link href="/politika" style={{ color: "#6d7f8e" }}>Политика конфиденциальности</Link>
        </div>
        <span>обновлено {updated}</span>
      </div>
    </footer>
    </>
  );
}
