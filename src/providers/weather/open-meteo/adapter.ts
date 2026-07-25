import type { DataSource } from "@/domain/source";
import type {
  WeatherCondition,
  WeatherContent,
} from "@/domain/weather";
import type { WeatherProvider } from "@/providers/contracts";

import {
  openMeteoResponseSchema,
  type OpenMeteoResponse,
} from "./schema";

export interface OpenMeteoConfig {
  locationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const source: DataSource = {
  id: "open-meteo",
  name: "Open-Meteo",
  url: "https://open-meteo.com/",
  attribution: "Weather data by Open-Meteo",
};

function weatherCondition(code: number): WeatherCondition {
  if (code === 0) return { code, label: "Clear", icon: "clear" };
  if (code <= 2) {
    return { code, label: "Partly cloudy", icon: "partly-cloudy" };
  }
  if (code === 3) return { code, label: "Overcast", icon: "cloudy" };
  if (code === 45 || code === 48) {
    return { code, label: "Fog", icon: "fog" };
  }
  if (code >= 51 && code <= 57) {
    return { code, label: "Drizzle", icon: "drizzle" };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { code, label: "Rain", icon: "rain" };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { code, label: "Snow", icon: "snow" };
  }
  if (code >= 95) return { code, label: "Thunderstorms", icon: "storm" };
  return { code, label: "Cloudy", icon: "cloudy" };
}

function offsetText(offsetSeconds: number): string {
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetSeconds) / 60;
  const hours = Math.floor(absoluteMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor(absoluteMinutes % 60)
    .toString()
    .padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function zonedIsoTimestamp(value: string, offsetSeconds: number): string {
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value).toISOString();
  }
  return new Date(`${value}${offsetText(offsetSeconds)}`).toISOString();
}

function requireIndex<T>(values: T[], index: number, field: string): T {
  const value = values[index];
  if (value === undefined) {
    throw new Error(`Open-Meteo response is missing ${field}[${index}]`);
  }
  return value;
}

export function normalizeOpenMeteoResponse(
  payload: OpenMeteoResponse,
  config: OpenMeteoConfig,
): WeatherContent {
  const forecast = payload.daily.time.slice(0, 6).map((date, index) => ({
    date,
    highC: requireIndex(
      payload.daily.temperature_2m_max,
      index,
      "temperature_2m_max",
    ),
    lowC: requireIndex(
      payload.daily.temperature_2m_min,
      index,
      "temperature_2m_min",
    ),
    precipitationProbability: requireIndex(
      payload.daily.precipitation_probability_max,
      index,
      "precipitation_probability_max",
    ),
    condition: weatherCondition(
      requireIndex(payload.daily.weather_code, index, "weather_code"),
    ),
    sunrise: zonedIsoTimestamp(
      requireIndex(payload.daily.sunrise, index, "sunrise"),
      payload.utc_offset_seconds,
    ),
    sunset: zonedIsoTimestamp(
      requireIndex(payload.daily.sunset, index, "sunset"),
      payload.utc_offset_seconds,
    ),
  }));

  const today = requireIndex(forecast, 0, "forecast");
  return {
    location: {
      name: config.locationName,
      latitude: payload.latitude,
      longitude: payload.longitude,
      timezone: payload.timezone || config.timezone,
    },
    current: {
      observedAt: zonedIsoTimestamp(
        payload.current.time,
        payload.utc_offset_seconds,
      ),
      temperatureC: payload.current.temperature_2m,
      feelsLikeC: payload.current.apparent_temperature,
      highC: today.highC,
      lowC: today.lowC,
      precipitationProbability: today.precipitationProbability,
      windSpeedKph: payload.current.wind_speed_10m,
      windDirectionDegrees: payload.current.wind_direction_10m,
      condition: weatherCondition(payload.current.weather_code),
      sunrise: today.sunrise,
      sunset: today.sunset,
      isDay: payload.current.is_day === 1,
    },
    forecast,
  };
}

export function createOpenMeteoProvider(
  config: OpenMeteoConfig,
  fetchImplementation: typeof fetch = fetch,
): WeatherProvider {
  return {
    id: source.id,
    source,
    async fetch(signal: AbortSignal): Promise<unknown> {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", config.latitude.toString());
      url.searchParams.set("longitude", config.longitude.toString());
      url.searchParams.set("timezone", config.timezone);
      url.searchParams.set("forecast_days", "6");
      url.searchParams.set(
        "current",
        [
          "temperature_2m",
          "apparent_temperature",
          "is_day",
          "weather_code",
          "wind_speed_10m",
          "wind_direction_10m",
        ].join(","),
      );
      url.searchParams.set(
        "daily",
        [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_probability_max",
          "sunrise",
          "sunset",
        ].join(","),
      );

      const response = await fetchImplementation(url, { signal });
      if (!response.ok) {
        throw new Error(
          `Open-Meteo request failed with ${response.status} ${response.statusText}`,
        );
      }
      return response.json() as Promise<unknown>;
    },
    parseAndNormalize(payload: unknown): WeatherContent {
      return normalizeOpenMeteoResponse(
        openMeteoResponseSchema.parse(payload),
        config,
      );
    },
  };
}

export { source as openMeteoSource };
