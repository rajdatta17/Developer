import { evaluateFreshness } from "./evaluate-freshness";

const policy = { staleAfterMinutes: 60, expiresAfterMinutes: 180 };

describe("evaluateFreshness", () => {
  it.each([
    ["2026-07-25T09:30:00.000Z", "fresh"],
    ["2026-07-25T08:30:00.000Z", "stale"],
    ["2026-07-25T06:30:00.000Z", "expired"],
  ] as const)("classifies %s as %s", (generatedAt, expected) => {
    expect(
      evaluateFreshness(
        generatedAt,
        new Date("2026-07-25T10:00:00.000Z"),
        policy,
      ).status,
    ).toBe(expected);
  });

  it("treats missing prior success as expired", () => {
    expect(
      evaluateFreshness(null, new Date("2026-07-25T10:00:00.000Z"), policy),
    ).toMatchObject({ status: "expired", lastSuccessfulAt: null });
  });
});

