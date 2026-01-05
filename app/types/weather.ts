export interface Weather {
  time: string;
  temperature: number;
  temperature_min: number;
  temperature_max: number;
  condition: string;
  uv_index: number;
}

export interface WeatherResponse {
  location: string;
  timezone: string;
  current: Weather;
  hourly: Weather[];
  daily: Weather[];
}
