export type WeatherCondition =
  | "clear"
  | "partly"
  | "cloudy"
  | "overcast"
  | "lightrain"
  | "rain"
  | "snow"
  | "fog";

export interface HourPoint {
  iso: string;
  time: string;
  temp: number;
  feels: number;
  condition: WeatherCondition;
  precip: number;
  wind: number;
  windDir: string;
  pressure: number;
}

export interface DayPoint {
  iso: string;
  dow: string;
  date: string;
  tmax: number;
  tmin: number;
  condition: WeatherCondition;
  conditionLabel: string;
  precip: number;
  wind: string;
}

export interface CurrentWeather {
  temp: number;
  feels: number;
  condition: WeatherCondition;
  conditionLabel: string;
  wind: number;
  windDir: string;
  gust: number;
  pressure: number;
  humidity: number;
  visibility: number;
  uv: number;
  precip: number;
  tmax: number;
  tmin: number;
}

export interface CityWeather {
  current: CurrentWeather;
  hours: HourPoint[];
  days: DayPoint[];
  updatedAt: string;
  /* true, если данные взяты из локального фолбэка (MET недоступен) */
  fallback: boolean;
}
