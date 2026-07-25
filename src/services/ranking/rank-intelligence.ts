import type {
  IntelligenceTopic,
  RankedIntelligenceItem,
} from "@/domain/briefing";
import type {
  CricketDocument,
  FootballDocument,
  WeatherDocument,
} from "@/domain/generated-data";
import type { Match } from "@/domain/sports";

interface RankInput {
  weather: WeatherDocument;
  cricket: CricketDocument;
  football: FootballDocument;
}

interface Candidate extends Omit<RankedIntelligenceItem, "rank"> {
  priority: number;
}

const matchStatePriority: Record<Match["status"], number> = {
  live: 30,
  upcoming: 15,
  completed: 5,
};

function matchCandidate(match: Match, topic: IntelligenceTopic): Candidate {
  const score = match.score
    ? ` ${match.homeTeam.shortName} ${match.score.home}–${match.score.away} ${match.awayTeam.shortName}.`
    : "";
  return {
    id: `${topic}-${match.id}`,
    topic,
    title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    summary: `${match.statusText}.${score}${match.narrative ? ` ${match.narrative}` : ""}`.replace(
      /\.\./g,
      ".",
    ),
    significance: match.significance,
    timestamp: match.startTime,
    priority: match.significance + matchStatePriority[match.status],
  };
}

function weatherCandidate(weather: WeatherDocument): Candidate | null {
  if (weather.freshness.status === "expired") return null;
  const current = weather.weather.current;
  const weatherImpact =
    current.precipitationProbability * 0.35 +
    Math.min(current.windSpeedKph, 60) * 0.35 +
    (current.condition.icon === "storm" ? 35 : 0);
  return {
    id: "weather-today",
    topic: "weather",
    title: `${current.condition.label} in ${weather.weather.location.name}`,
    summary: `${Math.round(current.highC)}° high, ${Math.round(current.precipitationProbability)}% precipitation probability, with winds near ${Math.round(current.windSpeedKph)} km/h.`,
    significance: Math.min(100, Math.round(35 + weatherImpact)),
    timestamp: current.observedAt,
    priority: 35 + weatherImpact,
  };
}

export function rankIntelligence(input: RankInput): RankedIntelligenceItem[] {
  const candidates: Candidate[] = [];
  const weather = weatherCandidate(input.weather);
  if (weather) candidates.push(weather);

  if (input.cricket.freshness.status !== "expired") {
    candidates.push(
      ...input.cricket.items.map((match) => matchCandidate(match, "cricket")),
    );
  }
  if (input.football.freshness.status !== "expired") {
    candidates.push(
      ...input.football.items.map((match) => matchCandidate(match, "football")),
    );
  }

  return candidates
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        left.timestamp.localeCompare(right.timestamp) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, 3)
    .map((candidate, index) => ({
      id: candidate.id,
      topic: candidate.topic,
      title: candidate.title,
      summary: candidate.summary,
      significance: candidate.significance,
      timestamp: candidate.timestamp,
      rank: index + 1,
    }));
}
