import type { Confidence, DayConsensus, ForecastConsensus } from "@/entities/weather";
import { WeatherIcon } from "@/entities/weather";
import { signedTemp } from "@/shared/lib/format";
import { tempColor } from "@/shared/lib/temp-color";

const CONFIDENCE: Record<Confidence, { label: string; color: string }> = {
  high: { label: "высокая", color: "#1f9d57" },
  medium: { label: "средняя", color: "#c98a00" },
  low: { label: "низкая", color: "#d6453f" },
};

/*
  Свод по нескольким моделям прогноза (ECMWF, GFS, ICON, MET Nordic): где
  источники сходятся — уверенность высокая, где расходятся — видно сразу.
*/
export function SourceConsensus({ consensus }: { consensus: ForecastConsensus }) {
  const { days, sources } = consensus;
  const cols = `132px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>
        Сравнение источников
      </h2>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6d7f8e" }}>
        Дневной максимум по {sources.length} моделям прогноза. Чем ближе цифры — тем надёжнее.
      </p>

      <div
        className="consensus-card"
        style={{
          border: "1px solid #d4dce5",
          boxShadow: "0 2px 12px rgba(20,33,43,.05)",
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          fontSize: 14,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: cols, alignItems: "stretch" }}>
          {/* шапка: дни */}
          <Cell head />
          {days.map((d) => (
            <Cell key={d.iso} head center>
              <div style={{ fontWeight: 700 }}>{d.dow}</div>
              <div style={{ fontSize: 12, color: "#6d7f8e" }}>{d.date}</div>
            </Cell>
          ))}

          {/* строки источников */}
          {sources.map((label, rowIdx) => (
            <Row key={label} zebra={rowIdx % 2 === 1}>
              <Cell label>{label}</Cell>
              {days.map((d) => {
                const t = tmaxFor(d, label);
                return (
                  <Cell key={d.iso} center>
                    {t === null ? (
                      <span style={{ color: "#b6c1cc" }}>—</span>
                    ) : (
                      <span style={{ fontWeight: 600, color: tempColor(t) }}>{signedTemp(t)}</span>
                    )}
                  </Cell>
                );
              })}
            </Row>
          ))}

          {/* консенсус */}
          <Row accent>
            <Cell label strong>Консенсус</Cell>
            {days.map((d) => (
              <Cell key={d.iso} center>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <WeatherIcon condition={d.condition} size={22} />
                  <span style={{ fontWeight: 800, color: tempColor(d.tmaxAvg) }}>{signedTemp(d.tmaxAvg)}</span>
                </div>
              </Cell>
            ))}
          </Row>

          {/* уверенность */}
          <Row accent>
            <Cell label>Уверенность</Cell>
            {days.map((d) => {
              const c = CONFIDENCE[d.confidence];
              return (
                <Cell key={d.iso} center>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5a6b7b" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flex: "none" }} />
                    {c.label}
                  </span>
                </Cell>
              );
            })}
          </Row>
        </div>
      </div>
    </div>
  );
}

function tmaxFor(day: DayConsensus, label: string): number | null {
  const src = day.sources.find((s) => s.source === label);
  return src ? src.tmax : null;
}

/* display: contents — дочерние ячейки попадают прямо в грид-родителя */
function Row({ children, zebra, accent }: { children: React.ReactNode; zebra?: boolean; accent?: boolean }) {
  return (
    <div
      style={{
        display: "contents",
        ["--row-bg" as string]: accent ? "#f4f8fc" : zebra ? "#fafbfc" : "#fff",
      }}
    >
      {children}
    </div>
  );
}

function Cell({
  children,
  head,
  label,
  center,
  strong,
}: {
  children?: React.ReactNode;
  head?: boolean;
  label?: boolean;
  center?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid #f0f3f6",
        background: head ? "#f7f9fb" : "var(--row-bg, #fff)",
        textAlign: center ? "center" : "left",
        fontWeight: strong ? 800 : label ? 700 : 400,
        color: label ? "#3a4756" : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}
