import type { City } from "../model/types";

const PREPOSITIONAL: Record<string, string> = {
  murmansk: "Мурманске",
  apatity: "Апатитах",
  gadzhievo: "Гаджиево",
  ostrovnoj: "Островном",
  zaozjorsk: "Заозёрске",
  zapolyarnyj: "Заполярном",
  kandalaksha: "Кандалакше",
  kirovsk: "Кировске",
  kovdor: "Ковдоре",
  kola: "Коле",
  monchegorsk: "Мончегорске",
  olenegorsk: "Оленегорске",
  "polyarnye-zori": "Полярных Зорях",
  polyarnyj: "Полярном",
  severomorsk: "Североморске",
  snezhnogorsk: "Снежногорске",
};

/* Предложный падеж названия для конструкции "в {city}".
   Для городов — словарная форма; для прочих точек и отсутствующих в карте — номинатив
   (используется с "в городе X", "в посёлке X" и т.п., где падеж не нужен). */
export function prepName(city: City): string {
  if (city.kind === "город") {
    return PREPOSITIONAL[city.slug] ?? city.name;
  }
  return city.name;
}
