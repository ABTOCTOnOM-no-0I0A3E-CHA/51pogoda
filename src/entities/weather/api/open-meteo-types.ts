/*
  Ответ Open-Meteo при запросе нескольких моделей: каждая переменная в `daily`
  суффиксируется id модели — temperature_2m_max_ecmwf_ifs025 и т.п. Типизируем
  индексно, разбор по конкретным ключам — в lib/consensus.
*/
export interface OpenMeteoDaily {
  time: string[];
  [variable: string]: Array<number | null> | string[];
}

export interface OpenMeteoForecast {
  daily?: OpenMeteoDaily;
}
