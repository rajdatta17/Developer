import fixture from "../../../../fixtures/weather/open-meteo.json";

import { createOpenMeteoProvider } from "./adapter";

describe("Open-Meteo adapter", () => {
  it("validates and normalizes provider data", () => {
    const provider = createOpenMeteoProvider({
      locationName: "New York",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
    });

    const weather = provider.parseAndNormalize(fixture);

    expect(weather.location.name).toBe("New York");
    expect(weather.current.condition.icon).toBe("partly-cloudy");
    expect(weather.current.highC).toBe(29.2);
    expect(weather.forecast).toHaveLength(6);
    expect(weather.current.sunrise).toBe("2026-07-25T09:47:00.000Z");
  });

  it("rejects incomplete provider payloads", () => {
    expect(() => providerForInvalidPayload().parseAndNormalize({})).toThrow();
  });
});

function providerForInvalidPayload() {
  return createOpenMeteoProvider({
    locationName: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
  });
}

