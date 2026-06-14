export interface MetInstantDetails {
  air_temperature?: number;
  air_pressure_at_sea_level?: number;
  relative_humidity?: number;
  wind_speed?: number;
  wind_speed_of_gust?: number;
  wind_from_direction?: number;
  cloud_area_fraction?: number;
  fog_area_fraction?: number;
  ultraviolet_index_clear_sky?: number;
}

export interface MetPeriod {
  summary?: { symbol_code?: string };
  details?: { precipitation_amount?: number };
}

export interface MetTimeseriesEntry {
  time: string;
  data: {
    instant: { details: MetInstantDetails };
    next_1_hours?: MetPeriod;
    next_6_hours?: MetPeriod;
    next_12_hours?: MetPeriod;
  };
}

export interface MetForecast {
  properties: {
    meta: { updated_at: string };
    timeseries: MetTimeseriesEntry[];
  };
}
