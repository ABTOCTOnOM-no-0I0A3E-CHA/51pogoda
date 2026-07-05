import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/shared/config/site";
import { getAllCities } from "@/entities/city/lib/registry";
import { getRegionCities } from "@/entities/city";

export const metadata: Metadata = {
  title: "О проекте",
  description: "Норметео — норвежский сайт погоды для Мурманской области. Источники данных, миссия, особенности прогноза для Заполярья.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const cities = getRegionCities();
  const total = getAllCities().length;

  return (
    <div className="content-padding" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 48px" }}>
      <nav style={{ fontSize: 13, color: "#6d7f8e", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>Главная</Link>
        <span style={{ margin: "0 6px" }}>·</span>
        <span style={{ color: "#5a6b7b" }}>О проекте</span>
      </nav>

      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.02em" }}>О проекте {SITE.name}</h1>
      <p style={{ fontSize: 13, color: "#6d7f8e", marginTop: 6 }}>Норвежский сайт погоды для Мурманской области</p>

      <section style={{ marginTop: 28 }}>
        <h2 style={h2Style}>Что это</h2>
        <p style={pStyle}>
          {SITE.name} — региональный погодный сервис для Мурманской области и всего Кольского полуострова.
          Мы собираем прогноз для {total} точек региона: от Мурманска и Апатитов до маяков, рыболовных
          лагерей и КПП на границе. Такой детализации нет ни у одного общероссийского погодного сайта —
          обычно показывают 5–10 крупных городов, а посёлки и станции остаются без прогноза.
        </p>
        <p style={pStyle}>
          Главная фишка — данные норвежского метеорологического института MET Norway (сайт yr.no).
          Норвежцы исторически лучше всех прогнозируют погоду в Арктике: их модели затачиваны под
          северные широты, полярные фронты и сложную топографию Скандинавии. Для Заполярья это
          объективно самый точный источник.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>Почему норвежский сайт</h2>
        <p style={pStyle}>
          Мурманская область находится за Полярным кругом — это территория, которую норвежские
          метеорологи знают лучше других. MET Norway (Norwegian Meteorological Institute) курирует
          прогнозы для всей Северной Европы и Арктики, и их модель MET Nordic специально
          настроена на северные широты.
        </p>
        <p style={pStyle}>
          Большинство российских погодных сайтов используют глобальные модели (GFS, ICON) без
          региональной адаптации. Мы берём прогноз напрямую у норвежцев — потому что для Кольского
          полуострова это просто работает лучше.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>Источники данных</h2>
        <ul style={ulStyle}>
          <li>
            <strong>MET Norway (yr.no)</strong> — основной прогноз. Официальный API api.met.no,
            данные обновляются каждые 30 минут. Точное почасовое прогнозирование, метеограмма
            на 2 суток и прогноз на 10 дней.
          </li>
          <li>
            <strong>Open-Meteo</strong> — консенсус-прогноз. Сводим данные 4 численных моделей
            (ECMWF, GFS, ICON, MET Nordic) и показываем разброс. Если модели сходятся — прогноз
            надёжный, если расходятся — видим возможные сюрпризы.
          </li>
          <li>
            <strong>ИИ-сводка</strong> — текст прогноза простым языком. Нейросеть анализирует
            данные и пишет: «Сегодня тепло, но к вечеру дождь — зонт пригодится». Без канцелярита
            и без воды.
          </li>
          <li>
            <strong>Windy</strong> — интерактивная карта осадков в реальном времени (радар ECMWF).
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>Особенности Заполярья</h2>
        <p style={pStyle}>
          Погода в Мурманской области не похожа на погоду в средней полосе. Полярный день
          (с конца мая по конец июля) — солнце не садится круглые сутки. Полярная ночь
          (с начала декабря по середину января) — солнце не поднимается. Это влияет на температуру,
          влажность, ветры — и на то, как нужно одеваться.
        </p>
        <p style={pStyle}>
          {SITE.name} учитывает полярные фазы: в сводках упоминается полярный день или ночь,
          в карточках городов — бейдж «Полярный день» или «Полярная ночь». Это не академическая
          справка, а практическая информация: если полярный день — не ждите темноты для сна,
          нужны плотные шторы.
        </p>
        <p style={pStyle}>
          Ветра в Заполярье — отдельная история. Сильные порывы с Баренцева моря могут длиться
          сутками. Наш прогноз показывает не только направление и скорость, но и порывы —
          потому что 10 м/с среднего ветра и 20 м/с в порывах — это разные вещи.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>Для кого</h2>
        <p style={pStyle}>
          Сайт будет полезен всем, кто живёт или работает в Мурманской области:
        </p>
        <ul style={ulStyle}>
          <li><strong>Жителям</strong> — планирование дня, выбор одежды, решение брать ли зонт</li>
          <li><strong>Рыбакам</strong> — {total} точек включают рыболовные лагеря и берега рек</li>
          <li><strong>Туристам</strong> — прогноз для турбаз, маяков, природных достопримечательностей</li>
          <li><strong>Водителям</strong> — прогноз для КПП, станций, перевалов</li>
          <li><strong>Морякам</strong> — прогноз для портов и акваторий</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>Города и точки</h2>
        <p style={pStyle}>
          Мы покрываем {cities.length} городов Мурманской области и ещё {total - cities.length}
          других точек: посёлки, сёла, станции, маяки, аэродромы, турбазы, рыболовные лагеря,
          КПП и акватории. Вот основные города:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", fontSize: 13, marginTop: 12 }}>
          {cities.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} style={{ color: "#0b5cad", fontWeight: 600 }}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>Контакты</h2>
        <p style={pStyle}>
          Вопросы, предложения, сообщения об ошибках:{" "}
          <a href="mailto:contact@51pogoda.ru" style={linkStyle}>contact@51pogoda.ru</a>
        </p>
        <p style={pStyle}>
          {SITE.name} — норвежский сайт погоды по данным MET Norway (yr.no) и Open-Meteo.
          Прогноз для Мурманской области: {total} точек, от Мурманска до маяков и рыболовных
          лагерей.
        </p>
      </section>
    </div>
  );
}

const pStyle = { margin: "8px 0", lineHeight: 1.65, fontSize: 14, color: "#3a4a58" } as const;
const h2Style = { fontSize: 18, fontWeight: 800, marginBottom: 8, marginTop: 0 } as const;
const ulStyle = { margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.65, fontSize: 14, color: "#3a4a58" } as const;
const linkStyle = { color: "#0b5cad", fontWeight: 600 } as const;
