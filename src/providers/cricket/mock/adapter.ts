import type { CricketProvider } from "@/providers/contracts";
import { createMockSportsProvider } from "@/providers/shared/create-mock-sports-provider";

export function createMockCricketProvider(payload: unknown): CricketProvider {
  return createMockSportsProvider({
    id: "mock-cricket",
    name: "Daybreak Cricket Demo",
    sport: "cricket",
    payload,
  });
}

