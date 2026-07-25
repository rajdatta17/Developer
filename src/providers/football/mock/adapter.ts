import type { FootballProvider } from "@/providers/contracts";
import { createMockSportsProvider } from "@/providers/shared/create-mock-sports-provider";

export function createMockFootballProvider(payload: unknown): FootballProvider {
  return createMockSportsProvider({
    id: "mock-football",
    name: "Daybreak Football Demo",
    sport: "football",
    payload,
  });
}

