export type FreshnessState = "fresh" | "stale" | "expired";

export interface SourceView {
  readonly name: string;
  readonly url?: string;
}

export interface DataMetaView {
  readonly generatedAt: string;
  readonly freshness: FreshnessState;
  readonly source: SourceView;
  readonly error?: string;
}

export interface ForecastDayView {
  readonly date: string;
  readonly label: string;
  readonly condition: string;
  readonly conditionCode: string;
  readonly high: number;
  readonly low: number;
  readonly precipitationProbability: number;
}

export interface WeatherView extends DataMetaView {
  readonly location: string;
  readonly timezone?: string;
  readonly temperature: number;
  readonly condition: string;
  readonly conditionCode: string;
  readonly feelsLike: number;
  readonly precipitationProbability: number;
  readonly windSpeed: number;
  readonly windDirection?: string;
  readonly high: number;
  readonly low: number;
  readonly sunrise: string;
  readonly sunset: string;
  readonly forecast: readonly ForecastDayView[];
}

export type MatchState = "live" | "upcoming" | "completed";

export interface MatchTeamView {
  readonly name: string;
  readonly shortName?: string;
  readonly score?: string;
  readonly detail?: string;
}

export interface MatchView {
  readonly id: string;
  readonly competition: string;
  readonly status: MatchState;
  readonly statusText: string;
  readonly startTime: string;
  readonly home: MatchTeamView;
  readonly away: MatchTeamView;
  readonly narrative?: string;
}

export interface SportsView extends DataMetaView {
  readonly headline?: string;
  readonly matches: readonly MatchView[];
}

export type IntelligenceTopic = "weather" | "cricket" | "football";

export interface WorthKnowingView {
  readonly id: string;
  readonly topic: IntelligenceTopic;
  readonly eyebrow: string;
  readonly title: string;
  readonly detail?: string;
}

export interface BriefingView extends DataMetaView {
  readonly greeting?: string;
  readonly sentences: readonly string[];
  readonly worthKnowing: readonly WorthKnowingView[];
}

export interface ProviderStateView {
  readonly id: string;
  readonly label: string;
  readonly freshness: FreshnessState;
  readonly error?: string;
}

export interface DashboardStatusView {
  readonly generatedAt: string;
  readonly lastAttemptAt: string;
  readonly lastSuccessAt?: string;
  readonly providers: readonly ProviderStateView[];
}

export interface DashboardViewModel {
  readonly weather: WeatherView;
  readonly cricket: SportsView;
  readonly football: SportsView;
  readonly briefing: BriefingView;
  readonly status: DashboardStatusView;
  readonly projectUrl?: string;
}
