import Link from "next/link";
import type { City, CityKind } from "@/entities/city";

interface LocationsCatalogProps {
  items: readonly City[];
  /* Виды точек, которые не показывать (например, города уже есть выше карточками) */
  excludeKinds?: CityKind[];
  id?: string;
}

const GROUP_ORDER: CityKind[] = [
  "город", "пгт", "село", "станция", "порт", "аэропорт",
  "маяк", "КПП", "турбаза", "база отдыха", "рыболовный лагерь", "акватория",
];

const GROUP_TITLE: Record<CityKind, string> = {
  "город": "Города",
  "пгт": "Посёлки городского типа",
  "село": "Сёла и посёлки",
  "станция": "Станции",
  "порт": "Порты",
  "аэропорт": "Аэропорты и аэродромы",
  "маяк": "Маяки",
  "КПП": "Пункты пропуска (КПП)",
  "турбаза": "Турбазы",
  "база отдыха": "Базы отдыха",
  "рыболовный лагерь": "Рыболовные лагеря",
  "акватория": "Акватории",
};

export function LocationsCatalog({ items, excludeKinds = [], id }: LocationsCatalogProps) {
  const skip = new Set(excludeKinds);
  const groups = GROUP_ORDER.filter((kind) => !skip.has(kind))
    .map((kind) => ({ kind, list: items.filter((c) => c.kind === kind) }))
    .filter((g) => g.list.length > 0);

  const total = groups.reduce((sum, g) => sum + g.list.length, 0);

  return (
    <section id={id} style={{ marginTop: 40, scrollMarginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>Все точки прогноза</h2>
        <span style={{ fontSize: 13, color: "#6d7f8e", fontWeight: 600 }}>{total}</span>
      </div>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "#6d7f8e" }}>
        Сёла, станции, маяки, КПП, аэродромы, турбазы и рыболовные лагеря Мурманской области — нажмите для подробного прогноза.
      </p>

      {groups.map((g) => (
        <div key={g.kind} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>{GROUP_TITLE[g.kind]}</h3>
            <span style={{ fontSize: 12, color: "#6d7f8e", fontWeight: 600 }}>{g.list.length}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {g.list.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="city-card"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  border: "1px solid #d4dce5",
                  borderRadius: 11,
                  padding: "9px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: "0 1px 6px rgba(20,33,43,.05)",
                  transition: "all .15s",
                }}
              >
                {c.name}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M9 6l6 6-6 6" stroke="#0b5cad" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
