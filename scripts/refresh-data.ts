import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";

import { z } from "zod";

import {
  briefingDocumentSchema,
  cricketDocumentSchema,
  footballDocumentSchema,
  statusDocumentSchema,
  weatherDocumentSchema,
  type DashboardData,
} from "@/domain/generated-data";
import type {
  CricketProvider,
  FootballProvider,
  WeatherProvider,
} from "@/providers/contracts";
import { createMockCricketProvider } from "@/providers/cricket/mock/adapter";
import { createMockFootballProvider } from "@/providers/football/mock/adapter";
import {
  createOpenMeteoProvider,
  type OpenMeteoConfig,
} from "@/providers/weather/open-meteo/adapter";
import { createMockWeatherProvider } from "@/providers/weather/mock/adapter";
import { DeterministicBriefingGenerator } from "@/services/briefing/deterministic-generator";
import { loadDashboardData } from "@/services/data/load-generated-data";
import {
  SPORTS_FRESHNESS_POLICY,
  WEATHER_FRESHNESS_POLICY,
  evaluateFreshness,
} from "@/services/freshness/evaluate-freshness";
import { refreshDashboard } from "@/services/refresh/refresh-dashboard";

const environmentSchema = z.object({
  DAYBREAK_LOCATION_NAME: z.string().min(1).default("New York"),
  DAYBREAK_LATITUDE: z.coerce.number().min(-90).max(90).default(40.7128),
  DAYBREAK_LONGITUDE: z.coerce.number().min(-180).max(180).default(-74.006),
  DAYBREAK_TIMEZONE: z.string().min(1).default("America/New_York"),
  WEATHER_PROVIDER: z.enum(["open-meteo", "mock"]).default("open-meteo"),
  CRICKET_PROVIDER: z.literal("mock").default("mock"),
  FOOTBALL_PROVIDER: z.literal("mock").default("mock"),
});

const rootDirectory = process.cwd();
const outputDirectory = path.join(rootDirectory, "public", "data");

const localEnvironmentPath = path.join(rootDirectory, ".env.local");
if (existsSync(localEnvironmentPath)) {
  loadEnvFile(localEnvironmentPath);
}

async function readJson(relativePath: string): Promise<unknown> {
  const filePath = path.join(rootDirectory, relativePath);
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read fixture ${filePath}: ${message}`);
  }
}

function createBootstrapData(
  weatherProvider: WeatherProvider,
  cricketProvider: CricketProvider,
  footballProvider: FootballProvider,
  payloads: { weather: unknown; cricket: unknown; football: unknown },
  now: Date,
): DashboardData {
  const generatedAt = now.toISOString();
  const weather = weatherDocumentSchema.parse({
    schemaVersion: 1,
    generatedAt,
    lastAttemptAt: generatedAt,
    source: weatherProvider.source,
    freshness: evaluateFreshness(
      generatedAt,
      now,
      WEATHER_FRESHNESS_POLICY,
    ),
    weather: weatherProvider.parseAndNormalize(payloads.weather),
  });
  const cricket = cricketDocumentSchema.parse({
    schemaVersion: 1,
    generatedAt,
    lastAttemptAt: generatedAt,
    source: cricketProvider.source,
    freshness: evaluateFreshness(
      generatedAt,
      now,
      SPORTS_FRESHNESS_POLICY,
    ),
    ...cricketProvider.parseAndNormalize(payloads.cricket),
  });
  const football = footballDocumentSchema.parse({
    schemaVersion: 1,
    generatedAt,
    lastAttemptAt: generatedAt,
    source: footballProvider.source,
    freshness: evaluateFreshness(
      generatedAt,
      now,
      SPORTS_FRESHNESS_POLICY,
    ),
    ...footballProvider.parseAndNormalize(payloads.football),
  });
  const briefingSource = {
    id: "daybreak-deterministic",
    name: "Daybreak deterministic briefing",
    url: "https://github.com/",
    attribution: "Generated locally from normalized source data",
  };
  const briefing = briefingDocumentSchema.parse({
    schemaVersion: 1,
    generatedAt,
    lastAttemptAt: generatedAt,
    source: briefingSource,
    freshness: evaluateFreshness(
      generatedAt,
      now,
      SPORTS_FRESHNESS_POLICY,
    ),
    briefing: new DeterministicBriefingGenerator().generate({
      weather,
      cricket,
      football,
      now,
    }),
  });
  const status = statusDocumentSchema.parse({
    schemaVersion: 1,
    generatedAt,
    source: briefingSource,
    overall: "ok",
    items: [weatherProvider, cricketProvider, footballProvider].map(
      (provider) => ({
        provider: provider.id,
        state: "ok",
        lastAttemptAt: generatedAt,
        lastSuccessfulAt: generatedAt,
      }),
    ),
  });
  return { weather, cricket, football, briefing, status };
}

async function main(): Promise<void> {
  const environment = environmentSchema.parse(process.env);
  const config: OpenMeteoConfig = {
    locationName: environment.DAYBREAK_LOCATION_NAME,
    latitude: environment.DAYBREAK_LATITUDE,
    longitude: environment.DAYBREAK_LONGITUDE,
    timezone: environment.DAYBREAK_TIMEZONE,
  };
  const payloads = {
    weather: await readJson("fixtures/weather/open-meteo.json"),
    cricket: await readJson("fixtures/cricket/mock-matches.json"),
    football: await readJson("fixtures/football/mock-matches.json"),
  };
  const mockWeather = createMockWeatherProvider(payloads.weather, config);
  const weatherProvider =
    environment.WEATHER_PROVIDER === "mock"
      ? mockWeather
      : createOpenMeteoProvider(config);
  const cricketProvider = createMockCricketProvider(payloads.cricket);
  const footballProvider = createMockFootballProvider(payloads.football);
  const now = new Date();

  let previous: DashboardData;
  try {
    previous = loadDashboardData(outputDirectory);
  } catch {
    previous = createBootstrapData(
      mockWeather,
      cricketProvider,
      footballProvider,
      payloads,
      now,
    );
  }

  const data = await refreshDashboard({
    providers: {
      weather: weatherProvider,
      cricket: cricketProvider,
      football: footballProvider,
    },
    previous,
    outputDirectory,
    now,
  });
  console.log(
    `Daybreak data refreshed at ${data.status.generatedAt}: ${data.status.overall}`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : error;
  console.error(`Daybreak refresh failed: ${String(message)}`);
  process.exitCode = 1;
});
