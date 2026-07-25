import type { WeatherProvider } from "@/providers/contracts";
import {
  normalizeOpenMeteoResponse,
  type OpenMeteoConfig,
} from "@/providers/weather/open-meteo/adapter";
import { openMeteoResponseSchema } from "@/providers/weather/open-meteo/schema";

export function createMockWeatherProvider(
  payload: unknown,
  config: OpenMeteoConfig,
): WeatherProvider {
  return {
    id: "mock-weather",
    source: {
      id: "mock-weather",
      name: "Daybreak Weather Demo",
      url: "https://open-meteo.com/",
      attribution: "Realistic fixture shaped from Open-Meteo data",
    },
    async fetch(): Promise<unknown> {
      return payload;
    },
    parseAndNormalize(value: unknown) {
      return normalizeOpenMeteoResponse(
        openMeteoResponseSchema.parse(value),
        config,
      );
    },
  };
}

