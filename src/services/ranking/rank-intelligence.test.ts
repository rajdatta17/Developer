import {
  createCricketDocument,
  createFootballDocument,
  createMatch,
  createWeatherDocument,
} from "@/test/factories";

import { rankIntelligence } from "./rank-intelligence";

describe("rankIntelligence", () => {
  it("puts a significant live event ahead of upcoming events", () => {
    const cricket = createCricketDocument([
      createMatch({
        id: "live",
        status: "live",
        significance: 80,
        statusText: "Tea, day two",
      }),
      createMatch({ id: "upcoming", status: "upcoming", significance: 90 }),
    ]);

    const ranked = rankIntelligence({
      weather: createWeatherDocument(),
      cricket,
      football: createFootballDocument([]),
    });

    expect(ranked[0]?.id).toBe("cricket-live");
    expect(ranked.map((item) => item.rank)).toEqual([1, 2, 3]);
  });

  it("excludes expired topics", () => {
    const football = createFootballDocument();
    football.freshness.status = "expired";
    expect(
      rankIntelligence({
        weather: createWeatherDocument(),
        cricket: createCricketDocument([]),
        football,
      }).some((item) => item.topic === "football"),
    ).toBe(false);
  });
});

