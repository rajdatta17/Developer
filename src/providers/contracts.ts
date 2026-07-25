import type { DataSource } from "@/domain/source";
import type { SportContent } from "@/domain/sports";
import type { WeatherContent } from "@/domain/weather";

export interface ProviderAdapter<TOutput> {
  readonly id: string;
  readonly source: DataSource;
  fetch(signal: AbortSignal): Promise<unknown>;
  parseAndNormalize(payload: unknown): TOutput;
}

export type WeatherProvider = ProviderAdapter<WeatherContent>;
export type CricketProvider = ProviderAdapter<SportContent>;
export type FootballProvider = ProviderAdapter<SportContent>;

