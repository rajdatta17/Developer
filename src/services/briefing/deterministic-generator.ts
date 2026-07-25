import type { BriefingContent } from "@/domain/briefing";
import type { Match } from "@/domain/sports";
import { rankIntelligence } from "@/services/ranking/rank-intelligence";

import type { BriefingContext, BriefingGenerator } from "./generator";

function firstMatch(items: Match[]): Match | undefined {
  const statusOrder: Record<Match["status"], number> = {
    live: 0,
    upcoming: 1,
    completed: 2,
  };
  return [...items].sort(
    (left, right) =>
      statusOrder[left.status] - statusOrder[right.status] ||
      right.significance - left.significance ||
      left.startTime.localeCompare(right.startTime),
  )[0];
}

function sportSentence(sportName: string, match: Match | undefined): string {
  if (!match) {
    return `There are no ${sportName.toLowerCase()} fixtures in the current data window.`;
  }
  const matchup = `${match.homeTeam.name} and ${match.awayTeam.name}`;
  if (match.status === "live") {
    const score = match.score
      ? ` at ${match.score.home}–${match.score.away}`
      : "";
    return `${matchup} are live in ${match.competition}${score}; ${match.statusText.toLowerCase()}.`;
  }
  if (match.status === "completed") {
    const score = match.score
      ? ` ${match.score.home}–${match.score.away}`
      : "";
    return `${matchup} finished${score} in ${match.competition}${match.narrative ? `, ${match.narrative.toLowerCase()}` : ""}.`;
  }
  return `${matchup} are next up in ${match.competition}; ${match.statusText.toLowerCase()}.`;
}

function weatherSentence(context: BriefingContext): string {
  if (context.weather.freshness.status === "expired") {
    return "Current weather data is unavailable, so no conditions have been inferred.";
  }
  const { current } = context.weather.weather;
  return `${current.condition.label} conditions lead the day in ${context.weather.weather.location.name}, with a high near ${Math.round(current.highC)}°C and a ${Math.round(current.precipitationProbability)}% chance of precipitation.`;
}

export class DeterministicBriefingGenerator implements BriefingGenerator {
  generate(context: BriefingContext): BriefingContent {
    const cricket =
      context.cricket.freshness.status === "expired"
        ? undefined
        : firstMatch(context.cricket.items);
    const football =
      context.football.freshness.status === "expired"
        ? undefined
        : firstMatch(context.football.items);

    const sentences = [
      weatherSentence(context),
      sportSentence("Cricket", cricket),
      sportSentence("Football", football),
    ];
    const staleTopics = [
      context.weather.freshness.status !== "fresh" ? "weather" : null,
      context.cricket.freshness.status !== "fresh" ? "cricket" : null,
      context.football.freshness.status !== "fresh" ? "football" : null,
    ].filter((topic): topic is string => topic !== null);
    if (staleTopics.length > 0) {
      sentences.push(
        `Freshness is limited for ${staleTopics.join(", ")}; timestamps are shown before older details are used.`,
      );
    }

    return {
      sentences,
      worthKnowing: rankIntelligence(context),
      inputs: [
        {
          topic: "weather",
          freshness: context.weather.freshness.status,
          generatedAt: context.weather.generatedAt,
        },
        {
          topic: "cricket",
          freshness: context.cricket.freshness.status,
          generatedAt: context.cricket.generatedAt,
        },
        {
          topic: "football",
          freshness: context.football.freshness.status,
          generatedAt: context.football.generatedAt,
        },
      ],
    };
  }
}

