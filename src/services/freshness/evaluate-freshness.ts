import type { Freshness } from "@/domain/source";

export interface FreshnessPolicy {
  staleAfterMinutes: number;
  expiresAfterMinutes: number;
}

export const WEATHER_FRESHNESS_POLICY: FreshnessPolicy = {
  staleAfterMinutes: 240,
  expiresAfterMinutes: 720,
};

export const SPORTS_FRESHNESS_POLICY: FreshnessPolicy = {
  staleAfterMinutes: 180,
  expiresAfterMinutes: 720,
};

export function evaluateFreshness(
  lastSuccessfulAt: string | null,
  now: Date,
  policy: FreshnessPolicy,
): Freshness {
  if (policy.expiresAfterMinutes <= policy.staleAfterMinutes) {
    throw new Error("Freshness expiry must be later than the stale threshold");
  }

  if (lastSuccessfulAt === null) {
    return {
      status: "expired",
      lastSuccessfulAt: null,
      ageMinutes: policy.expiresAfterMinutes,
      ...policy,
    };
  }

  const generatedTime = new Date(lastSuccessfulAt).getTime();
  if (!Number.isFinite(generatedTime)) {
    throw new Error(`Invalid freshness timestamp: ${lastSuccessfulAt}`);
  }
  const ageMinutes = Math.max(0, (now.getTime() - generatedTime) / 60_000);
  const status =
    ageMinutes >= policy.expiresAfterMinutes
      ? "expired"
      : ageMinutes >= policy.staleAfterMinutes
        ? "stale"
        : "fresh";
  return {
    status,
    lastSuccessfulAt,
    ageMinutes: Math.round(ageMinutes * 10) / 10,
    ...policy,
  };
}

