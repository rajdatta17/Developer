import type { DashboardData } from "@/domain/generated-data";
import type { Match } from "@/domain/sports";
import type { WeatherContent } from "@/domain/weather";

import type {
  DashboardStatusView,
  DashboardViewModel,
  ForecastDayView,
  MatchView,
  SportsView,
  WeatherView,
} from "./dashboard-types";

function forecastLabel(date: string, index: number): string {
  if (index === 0) return "Today";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

function windDirection(degrees: number): string {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  return points[Math.round(degrees / 45) % points.length];
}

function mapMatch(match: Match): MatchView {
  return {
    away: {
      name: match.awayTeam.name,
      shortName: match.awayTeam.shortName,
      score: match.score?.away,
    },
    competition: match.competition,
    home: {
      name: match.homeTeam.name,
      shortName: match.homeTeam.shortName,
      score: match.score?.home,
    },
    id: match.id,
    narrative: match.narrative,
    startTime: match.startTime,
    status: match.status,
    statusText: match.statusText,
  };
}

function mapSports(
  document: DashboardData["cricket"] | DashboardData["football"],
): SportsView {
  return {
    error: document.error?.message,
    freshness: document.freshness.status,
    generatedAt: document.generatedAt,
    headline: document.leadingHeadline,
    matches: document.items.map(mapMatch),
    source: {
      name: document.source.name,
      url: document.source.url,
    },
  };
}

function mapStatus(status: DashboardData["status"]): DashboardStatusView {
  const attempts = status.items.map((item) => item.lastAttemptAt).sort();
  const successes = status.items
    .flatMap((item) => (item.lastSuccessfulAt ? [item.lastSuccessfulAt] : []))
    .sort();

  return {
    generatedAt: status.generatedAt,
    lastAttemptAt: attempts.at(-1) ?? status.generatedAt,
    lastSuccessAt: successes.at(-1),
    providers: status.items.map((item) => ({
      error: item.message,
      freshness: item.state === "ok" ? "fresh" : item.state === "degraded" ? "stale" : "expired",
      id: item.provider,
      label: item.provider,
    })),
  };
}

interface WeatherViewMetadata {
  readonly error?: string;
  readonly freshness: WeatherView["freshness"];
  readonly generatedAt: string;
  readonly source: WeatherView["source"];
}

export function weatherContentToView(
  content: WeatherContent,
  metadata: WeatherViewMetadata,
): WeatherView {
  const current = content.current;
  const forecast: ForecastDayView[] = content.forecast.slice(0, 5).map((day, index) => ({
    condition: day.condition.label,
    conditionCode: day.condition.icon,
    date: day.date,
    high: day.highC,
    label: forecastLabel(day.date, index),
    low: day.lowC,
    precipitationProbability: day.precipitationProbability,
  }));

  return {
    condition: current.condition.label,
    conditionCode: current.condition.icon,
    error: metadata.error,
    feelsLike: current.feelsLikeC,
    forecast,
    freshness: metadata.freshness,
    generatedAt: metadata.generatedAt,
    high: current.highC,
    location: content.location.name,
    low: current.lowC,
    precipitationProbability: current.precipitationProbability,
    source: metadata.source,
    sunrise: current.sunrise,
    sunset: current.sunset,
    temperature: current.temperatureC,
    timezone: content.location.timezone,
    windDirection: windDirection(current.windDirectionDegrees),
    windSpeed: current.windSpeedKph,
  };
}

export function toDashboardViewModel(data: DashboardData): DashboardViewModel {
  const projectUrl = process.env.GITHUB_REPOSITORY
    ? `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${process.env.GITHUB_REPOSITORY}`
    : undefined;
  return {
    briefing: {
      error: data.briefing.error?.message,
      freshness: data.briefing.freshness.status,
      generatedAt: data.briefing.generatedAt,
      greeting: "Good morning",
      sentences: data.briefing.briefing.sentences,
      source: {
        name: data.briefing.source.name,
        url: data.briefing.source.url,
      },
      worthKnowing: data.briefing.briefing.worthKnowing.map((item) => ({
        detail: item.summary,
        eyebrow: item.topic,
        id: item.id,
        title: item.title,
        topic: item.topic,
      })),
    },
    cricket: mapSports(data.cricket),
    football: mapSports(data.football),
    projectUrl,
    status: mapStatus(data.status),
    weather: weatherContentToView(data.weather.weather, {
      error: data.weather.error?.message,
      freshness: data.weather.freshness.status,
      generatedAt: data.weather.generatedAt,
      source: {
        name: data.weather.source.name,
        url: data.weather.source.url,
      },
    }),
  };
}
