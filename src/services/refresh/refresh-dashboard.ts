import path from "node:path";

import {
  briefingDocumentSchema,
  cricketDocumentSchema,
  footballDocumentSchema,
  statusDocumentSchema,
  weatherDocumentSchema,
  type BriefingDocument,
  type CricketDocument,
  type DashboardData,
  type FootballDocument,
  type ProviderRefreshStatus,
  type StatusDocument,
  type WeatherDocument,
} from "@/domain/generated-data";
import type {
  CricketProvider,
  FootballProvider,
  WeatherProvider,
} from "@/providers/contracts";
import { DeterministicBriefingGenerator } from "@/services/briefing/deterministic-generator";
import {
  SPORTS_FRESHNESS_POLICY,
  WEATHER_FRESHNESS_POLICY,
} from "@/services/freshness/evaluate-freshness";

import { writeJsonAtomically } from "./atomic-json-writer";
import { refreshProvider, type RefreshResult } from "./preserve-last-valid";

interface RefreshDashboardOptions {
  providers: {
    weather: WeatherProvider;
    cricket: CricketProvider;
    football: FootballProvider;
  };
  previous: Pick<DashboardData, "weather" | "cricket" | "football">;
  outputDirectory: string;
  now?: Date;
}

const generatedSource = {
  id: "daybreak-deterministic",
  name: "Daybreak deterministic briefing",
  url: "https://github.com/",
  attribution: "Generated locally from attributed normalized sources",
} as const;

type ProviderDocument = WeatherDocument | CricketDocument | FootballDocument;

function providerStatus(
  provider: string,
  result: RefreshResult<ProviderDocument>,
  attemptedAt: string,
): ProviderRefreshStatus {
  return {
    provider,
    state: result.providerState,
    lastAttemptAt: attemptedAt,
    lastSuccessfulAt: result.document.freshness.lastSuccessfulAt,
    message: result.message,
  };
}

export async function refreshDashboard(
  options: RefreshDashboardOptions,
): Promise<DashboardData> {
  const now = options.now ?? new Date();
  const attemptedAt = now.toISOString();

  const [weatherResult, cricketResult, footballResult] = await Promise.all([
    refreshProvider({
      provider: options.providers.weather,
      previous: options.previous.weather,
      schema: weatherDocumentSchema,
      policy: WEATHER_FRESHNESS_POLICY,
      now,
      createDocument: (weather, metadata) => ({ ...metadata, weather }),
    }),
    refreshProvider({
      provider: options.providers.cricket,
      previous: options.previous.cricket,
      schema: cricketDocumentSchema,
      policy: SPORTS_FRESHNESS_POLICY,
      now,
      createDocument: (content, metadata) => ({ ...metadata, ...content }),
    }),
    refreshProvider({
      provider: options.providers.football,
      previous: options.previous.football,
      schema: footballDocumentSchema,
      policy: SPORTS_FRESHNESS_POLICY,
      now,
      createDocument: (content, metadata) => ({ ...metadata, ...content }),
    }),
  ]);

  const briefing: BriefingDocument = briefingDocumentSchema.parse({
    schemaVersion: 1,
    generatedAt: attemptedAt,
    lastAttemptAt: attemptedAt,
    source: generatedSource,
    freshness: {
      status:
        weatherResult.document.freshness.status === "expired" &&
        cricketResult.document.freshness.status === "expired" &&
        footballResult.document.freshness.status === "expired"
          ? "expired"
          : [
                weatherResult.document.freshness.status,
                cricketResult.document.freshness.status,
                footballResult.document.freshness.status,
              ].some((status) => status !== "fresh")
            ? "stale"
            : "fresh",
      lastSuccessfulAt: attemptedAt,
      ageMinutes: 0,
      staleAfterMinutes: 180,
      expiresAfterMinutes: 720,
    },
    briefing: new DeterministicBriefingGenerator().generate({
      weather: weatherResult.document,
      cricket: cricketResult.document,
      football: footballResult.document,
      now,
    }),
  });

  const statuses = [
    providerStatus(options.providers.weather.id, weatherResult, attemptedAt),
    providerStatus(options.providers.cricket.id, cricketResult, attemptedAt),
    providerStatus(options.providers.football.id, footballResult, attemptedAt),
  ];
  const overall = statuses.every((status) => status.state === "failed")
    ? "failed"
    : statuses.some((status) => status.state !== "ok")
      ? "degraded"
      : "ok";
  const status: StatusDocument = statusDocumentSchema.parse({
    schemaVersion: 1,
    generatedAt: attemptedAt,
    source: generatedSource,
    overall,
    items: statuses,
  });

  const dashboardData: DashboardData = {
    weather: weatherResult.document,
    cricket: cricketResult.document,
    football: footballResult.document,
    briefing,
    status,
  };
  await Promise.all(
    Object.entries(dashboardData).map(([name, document]) =>
      writeJsonAtomically(
        path.join(options.outputDirectory, `${name}.json`),
        document,
      ),
    ),
  );
  return dashboardData;
}
