import {
  createCricketDocument,
  createFootballDocument,
  createMatch,
  createWeatherDocument,
} from "@/test/factories";

import { DeterministicBriefingGenerator } from "./deterministic-generator";

describe("DeterministicBriefingGenerator", () => {
  const generator = new DeterministicBriefingGenerator();

  it("creates a natural bounded briefing from available facts", () => {
    const briefing = generator.generate({
      weather: createWeatherDocument(),
      cricket: createCricketDocument([
        createMatch({
          status: "live",
          score: { home: "286/6", away: "247" },
          statusText: "Lunch, day two",
        }),
      ]),
      football: createFootballDocument(),
      now: new Date("2026-07-25T10:00:00.000Z"),
    });

    expect(briefing.sentences).toHaveLength(3);
    expect(briefing.sentences.join(" ")).toContain("286/6–247");
    expect(briefing.worthKnowing.length).toBeLessThanOrEqual(3);
  });

  it("states missing data without inventing events", () => {
    const weather = createWeatherDocument();
    weather.freshness.status = "expired";
    const briefing = generator.generate({
      weather,
      cricket: createCricketDocument([]),
      football: createFootballDocument([]),
      now: new Date("2026-07-25T10:00:00.000Z"),
    });

    expect(briefing.sentences).toHaveLength(4);
    expect(briefing.sentences[0]).toContain("unavailable");
    expect(briefing.sentences[1]).toContain("no cricket fixtures");
    expect(briefing.sentences[2]).toContain("no football fixtures");
  });
});

