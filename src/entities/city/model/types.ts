export type CityKind =
  | "город"
  | "пгт"
  | "село"
  | "турбаза"
  | "база отдыха"
  | "рыболовный лагерь"
  | "КПП"
  | "маяк"
  | "аэропорт"
  | "порт"
  | "станция"
  | "акватория";

export interface City {
  slug: string;
  name: string;
  kind: CityKind;
  lat: number;
  lon: number;
  /* Идентификатор локации yr.no для официальной метеограммы */
  yrId: string;
}
