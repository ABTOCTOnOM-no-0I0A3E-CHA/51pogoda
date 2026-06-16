import { getAnalytics, HOME_KEY } from "@/shared/lib/analytics-store";
import { getCityMerged } from "@/entities/city/lib/registry";
import { ResetButton } from "./ResetButton";
import styles from "../../admin.module.css";

function lastDays(n: number): string[] {
  const out: string[] = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) out.push(new Date(now - i * 86400000).toISOString().slice(0, 10));
  return out;
}

function label(slug: string): string | undefined {
  if (slug === HOME_KEY) return "Главная";
  return getCityMerged(slug)?.name;
}

export default function AdminAnalyticsPage() {
  const data = getAnalytics();

  /* агрегат по точкам за всё время, только известные slug (остальное — шум/боты) */
  const perSlug: Record<string, number> = {};
  for (const stat of Object.values(data.days)) {
    for (const [slug, c] of Object.entries(stat.perSlug)) perSlug[slug] = (perSlug[slug] ?? 0) + c;
  }

  const rows = Object.entries(perSlug)
    .map(([slug, count]) => ({ slug, count, name: label(slug) }))
    .filter((r): r is { slug: string; count: number; name: string } => Boolean(r.name))
    .sort((a, b) => b.count - a.count);

  const known = (slug: string) => slug === HOME_KEY || Boolean(getCityMerged(slug));
  const dayCount = (day: string) => {
    const stat = data.days[day];
    if (!stat) return 0;
    let t = 0;
    for (const [slug, c] of Object.entries(stat.perSlug)) if (known(slug)) t += c;
    return t;
  };

  const series = lastDays(14).map((day) => ({ day, count: dayCount(day) }));
  const totalAll = rows.reduce((s, r) => s + r.count, 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = dayCount(todayKey);
  const last14 = series.reduce((s, d) => s + d.count, 0);
  const maxDay = Math.max(1, ...series.map((d) => d.count));
  const maxRow = rows.length ? rows[0]!.count : 1;

  return (
    <>
      <h1 className={styles.h1}>Аналитика</h1>
      <p className={styles.sub}>
        Просмотры страниц — серверный подсчёт без кук и внешних скриптов. Боты/несуществующие
        точки отфильтрованы.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <Stat label="Всего просмотров" value={totalAll} />
        <Stat label="Сегодня" value={today} />
        <Stat label="За 14 дней" value={last14} />
      </div>

      {totalAll === 0 ? (
        <div className={styles.card}>
          <p className={styles.muted}>
            Пока нет данных. Походите по страницам сайта — статистика появится (флаш на диск раз
            в ~10 секунд).
          </p>
        </div>
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Просмотры за 14 дней</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, marginTop: 8 }}>
              {series.map((d) => (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "#5b6b78" }}>{d.count || ""}</div>
                  <div
                    title={`${d.day}: ${d.count}`}
                    style={{
                      width: "100%",
                      height: `${Math.round((d.count / maxDay) * 104)}px`,
                      minHeight: d.count ? 3 : 0,
                      background: d.day === todayKey ? "#0b5cad" : "#9ec6ea",
                      borderRadius: 5,
                    }}
                  />
                  <div style={{ fontSize: 11, color: "#8a98a6" }}>{d.day.slice(8)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Топ точек ({rows.length})</div>
            <ul className={styles.list}>
              {rows.slice(0, 30).map((r) => (
                <li key={r.slug} className={styles.listItem} style={{ alignItems: "center" }}>
                  <strong style={{ minWidth: 180 }}>{r.name}</strong>
                  <div
                    style={{
                      height: 10,
                      width: `${Math.max(6, Math.round((r.count / maxRow) * 280))}px`,
                      background: "#9ec6ea",
                      borderRadius: 6,
                    }}
                  />
                  <span className={styles.muted}>{r.count}</span>
                  {r.slug !== HOME_KEY && <span className={styles.muted}>/{r.slug}</span>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className={styles.btnRow}>
        <ResetButton />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.card} style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>{value.toLocaleString("ru")}</div>
      <div className={styles.muted}>{label}</div>
    </div>
  );
}
