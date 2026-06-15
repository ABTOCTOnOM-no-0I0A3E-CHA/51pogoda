import type { CurrentWeather } from "@/entities/weather";
import { humidityLabel, uvLabel, visibilityLabel } from "@/entities/weather";
import { ParamCard, type ParamDef } from "@/features/param-tooltip";
import { precipLabel } from "@/shared/lib/format";

export function CurrentParams({ current }: { current: CurrentWeather }) {
  const params = buildParams(current);

  return (
    <div style={{ marginTop: 22 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>Подробно сейчас</h2>
      <div className="params-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {params.map((param) => (
          <ParamCard key={param.id} param={param} />
        ))}
      </div>
    </div>
  );
}

function degC(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value)} °C`;
}

function buildParams(c: CurrentWeather): ParamDef[] {
  return [
    {
      id: "temp",
      label: "Температура",
      value: degC(c.temp),
      sub: `днём до ${c.tmax > 0 ? "+" : ""}${c.tmax}°`,
      tipTitle: "Температура воздуха",
      tipText: "Фактическая температура в тени на высоте 2 м. Базовый показатель: насколько тепло или холодно сейчас.",
    },
    {
      id: "feels",
      label: "Ощущается",
      value: degC(c.feels),
      sub: "с поправкой на ветер",
      tipTitle: "Ощущаемая температура",
      tipText: "Как погоду воспринимает тело с учётом ветра и влажности. На ветру и в сырость ощущается холоднее реальной.",
    },
    {
      id: "wind",
      label: "Ветер",
      value: `${c.wind} м/с`,
      sub: `${c.windDir} · порывы ${c.gust}`,
      tipTitle: "Ветер",
      tipText: "Средняя скорость и направление (откуда дует). Порывы — кратковременные усиления. 1 м/с ≈ 3,6 км/ч.",
    },
    {
      id: "pressure",
      label: "Давление",
      value: String(c.pressure),
      sub: "мм рт. ст.",
      tipTitle: "Атмосферное давление",
      tipText: "Давление воздуха у поверхности. Норма для Заполярья ≈ 760 мм рт. ст. Резкое падение часто предвещает непогоду.",
    },
    {
      id: "humidity",
      label: "Влажность",
      value: `${c.humidity} %`,
      sub: humidityLabel(c.humidity),
      tipTitle: "Относительная влажность",
      tipText: "Доля влаги в воздухе от максимально возможной. Выше 80 % — сыро и промозгло, ниже 40 % — сухо.",
    },
    {
      id: "visibility",
      label: "Видимость",
      value: `${c.visibility} км`,
      sub: visibilityLabel(c.visibility),
      tipTitle: "Видимость",
      tipText: "Дальность, на которой различимы объекты. Падает в туман, дождь и метель — важно для дороги.",
    },
    {
      id: "uv",
      label: "УФ-индекс",
      value: String(c.uv),
      sub: uvLabel(c.uv),
      tipTitle: "Ультрафиолетовый индекс",
      tipText: "Сила УФ-излучения солнца по шкале 0–11+. 0–2 — низкий, защита не нужна; 3–5 — умеренный.",
    },
    {
      id: "precip",
      label: "Осадки",
      value: precipLabel(c.precip) || "0 мм",
      sub: "за час",
      tipTitle: "Осадки",
      tipText: "Количество дождя или растаявшего снега за период, в миллиметрах. 1 мм ≈ 1 литр воды на м².",
    },
  ];
}
