import fs from "node:fs";

const locations = JSON.parse(fs.readFileSync(new URL("../locations.json", import.meta.url)));

/* Официальные города Мурманской области */
const CITY_SLUGS = new Set([
  "murmansk", "apatity", "kandalaksha", "kirovsk", "kovdor", "kola",
  "monchegorsk", "olenegorsk", "severomorsk", "snezhnogorsk", "zaozjorsk",
  "gadzhievo", "zapolyarnyj", "polyarnyj", "ostrovnoj", "polyarnye-zori",
]);

/* Посёлки городского типа и ЗАТО-посёлки */
const PGT_SLUGS = new Set([
  "murmashi", "nikel", "pechenga", "revda", "umba", "zelenoborskij",
  "kildinstroj", "verkhnetulomskij", "tuloma", "molochnyj", "vysokij",
  "safonovo", "roslyakovo", "sputnik", "vidyaevo", "alakurtti",
  "afrikanda", "zasheek", "nivskij", "lesozavodskij", "enskij",
  "zarechensk", "tumannyj", "loparskaya", "shonguj", "pushnoj",
  "verkhnij-kildin", "korzunovo", "kilp-yavr", "kildinskoe",
]);

/* Типы точек определяем по описательному названию pogoda51 */
function kindFor(loc) {
  if (CITY_SLUGS.has(loc.slug)) return "город";
  if (PGT_SLUGS.has(loc.slug)) return "пгт";

  const n = loc.name.toLowerCase();

  if (/рыболов|рыбол\.|лагерь/.test(n)) return "рыболовный лагерь";
  if (/кпп/.test(n)) return "КПП";
  if (/маяк/.test(n)) return "маяк";
  if (/аэродром|аэропорт|а\/п|а\/д/.test(n)) return "аэропорт";
  if (/база отдыха|б\/о|гост|глэмп|лодж|этнопарк|арктик парк|дом авро|cedar|дубльдом|горнолыж|вильма/.test(n)) return "база отдыха";
  if (/турб|тур\.|вилладж|каравелла|оленья|сатка|сияние|здоровье|пиренга|голубая бухта/.test(n)) return "турбаза";
  if (/порт /.test(n)) return "порт";
  if (/станц|разъезд/.test(n)) return "станция";
  if (/(^|[^а-я])море([^а-я]|$)|озеро\b|баренц|белое море/.test(n)) return "акватория";

  return "село";
}

const ORDER = [
  "город", "пгт", "село", "станция", "порт", "аэропорт",
  "маяк", "КПП", "турбаза", "база отдыха", "рыболовный лагерь", "акватория",
];

const cities = locations
  .map((l) => ({ ...l, kind: kindFor(l) }))
  .sort((a, b) => {
    const ra = ORDER.indexOf(a.kind);
    const rb = ORDER.indexOf(b.kind);
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "ru");
  });

/* Мурманск всегда первым — это столица и hero главной */
cities.sort((a, b) => (a.slug === "murmansk" ? -1 : b.slug === "murmansk" ? 1 : 0));

const rows = cities
  .map(
    (c) =>
      `  { slug: ${JSON.stringify(c.slug)}, name: ${JSON.stringify(c.name)}, kind: ${JSON.stringify(c.kind)}, lat: ${c.lat}, lon: ${c.lon}, yrId: ${JSON.stringify(c.yrId)} },`,
  )
  .join("\n");

const file = `import type { City } from "./types";

/* Главный город — он же hero на главной странице */
export const CAPITAL_SLUG = "murmansk";

/*
  Точки прогноза Мурманской области: города, посёлки, сёла, станции, маяки,
  КПП, аэродромы, турбазы и рыболовные лагеря. Источник списка — pogoda51.ru,
  координаты и идентификаторы метеограмм yr.no получены через API yr.no
  (см. scripts/, locations.json — провенанс).
*/
export const CITIES: readonly City[] = [
${rows}
] as const;

const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function getCity(slug: string): City | undefined {
  return CITY_BY_SLUG.get(slug);
}

export function getCapital(): City {
  /* Гарантированно существует — slug захардкожен в списке выше */
  return CITY_BY_SLUG.get(CAPITAL_SLUG)!;
}

/* Только официальные города области — для сетки на главной (без столицы) */
export function getRegionCities(): City[] {
  return CITIES.filter((c) => c.slug !== CAPITAL_SLUG && c.kind === "город");
}

/* Все точки, кроме столицы — для каталога и поиска */
export function getAllExceptCapital(): City[] {
  return CITIES.filter((c) => c.slug !== CAPITAL_SLUG);
}
`;

fs.writeFileSync(new URL("../src/entities/city/model/cities.ts", import.meta.url), file);

const counts = cities.reduce((acc, c) => ((acc[c.kind] = (acc[c.kind] ?? 0) + 1), acc), {});
console.log(`Сгенерировано ${cities.length} точек:`, counts);
