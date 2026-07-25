import type { DataSource } from "@/domain/source";
import type { Match, SportContent } from "@/domain/sports";
import type { ProviderAdapter } from "@/providers/contracts";

import {
  mockSportsPayloadSchema,
  type MockSportsPayload,
} from "./mock-sports-schema";

interface MockSportsProviderOptions {
  id: string;
  name: string;
  sport: "cricket" | "football";
  payload: unknown;
}

function normalizeMatch(
  match: MockSportsPayload["matches"][number],
  sport: Match["sport"],
): Match {
  const score =
    match.homeScore !== null && match.awayScore !== null
      ? { home: match.homeScore, away: match.awayScore }
      : null;
  return {
    id: match.id,
    sport,
    competition: match.competition,
    competitionContext: match.context,
    homeTeam: match.home,
    awayTeam: match.away,
    startTime: match.startsAt,
    status:
      match.state === "LIVE"
        ? "live"
        : match.state === "FINAL"
          ? "completed"
          : "upcoming",
    statusText: match.statusText,
    score,
    narrative: match.narrative,
    significance: match.importance,
    lastUpdatedAt: match.updatedAt,
  };
}

export function createMockSportsProvider(
  options: MockSportsProviderOptions,
): ProviderAdapter<SportContent> {
  const source: DataSource = {
    id: options.id,
    name: options.name,
    url: "https://github.com/",
    attribution: `${options.name} realistic fixture data`,
  };
  return {
    id: options.id,
    source,
    async fetch(): Promise<unknown> {
      return options.payload;
    },
    parseAndNormalize(payload: unknown): SportContent {
      const parsed = mockSportsPayloadSchema.parse(payload);
      return {
        items: parsed.matches.map((match) =>
          normalizeMatch(match, options.sport),
        ),
        leadingHeadline: parsed.headline,
      };
    },
  };
}
