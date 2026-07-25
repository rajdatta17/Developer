import type {
  CricketDocument,
  FootballDocument,
  WeatherDocument,
} from "@/domain/generated-data";
import type { Match } from "@/domain/sports";

const generatedAt = "2026-07-25T10:00:00.000Z";

const source = {
  id: "test",
  name: "Test provider",
  url: "https://example.com",
  attribution: "Test data",
};

const freshness = {
  status: "fresh" as const,
  lastSuccessfulAt: generatedAt,
  ageMinutes: 0,
  staleAfterMinutes: 180,
  expiresAfterMinutes: 720,
};

export function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: "match-1",
    sport: "cricket",
    competition: "Test competition",
    homeTeam: { id: "home", name: "Home", shortName: "HOM" },
    awayTeam: { id: "away", name: "Away", shortName: "AWY" },
    startTime: "2026-07-25T12:00:00.000Z",
    status: "upcoming",
    statusText: "Starts soon",
    score: null,
    significance: 60,
    lastUpdatedAt: generatedAt,
    ...overrides,
  };
}

export function createWeatherDocument(): WeatherDocument {
  return {
    schemaVersion: 1,
    generatedAt,
    lastAttemptAt: generatedAt,
    source,
    freshness: { ...freshness },
    weather: {
      location: {
        name: "New York",
        latitude: 40.7128,
        longitude: -74.006,
        timezone: "America/New_York",
      },
      current: {
        observedAt: generatedAt,
        temperatureC: 24,
        feelsLikeC: 25,
        highC: 29,
        lowC: 21,
        precipitationProbability: 20,
        windSpeedKph: 9,
        windDirectionDegrees: 180,
        condition: { code: 2, label: "Partly cloudy", icon: "partly-cloudy" },
        sunrise: "2026-07-25T09:47:00.000Z",
        sunset: "2026-07-26T00:17:00.000Z",
        isDay: true,
      },
      forecast: [
        {
          date: "2026-07-25",
          highC: 29,
          lowC: 21,
          precipitationProbability: 20,
          condition: {
            code: 2,
            label: "Partly cloudy",
            icon: "partly-cloudy",
          },
          sunrise: "2026-07-25T09:47:00.000Z",
          sunset: "2026-07-26T00:17:00.000Z",
        },
      ],
    },
  };
}

export function createCricketDocument(
  items: Match[] = [createMatch()],
): CricketDocument {
  return {
    schemaVersion: 1,
    generatedAt,
    lastAttemptAt: generatedAt,
    source,
    freshness: { ...freshness },
    items,
  };
}

export function createFootballDocument(
  items: Match[] = [createMatch({ id: "football-1", sport: "football" })],
): FootballDocument {
  return {
    schemaVersion: 1,
    generatedAt,
    lastAttemptAt: generatedAt,
    source,
    freshness: { ...freshness },
    items,
  };
}

