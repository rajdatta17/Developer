import { AlertTriangle, CircleCheck } from "lucide-react";

import type { DataMetaView, FreshnessState } from "../dashboard-types";

const labels: Record<FreshnessState, string> = {
  expired: "Data may be out of date",
  fresh: "Current",
  stale: "Last valid update shown",
};

interface FreshnessNoteProps {
  readonly meta: Pick<DataMetaView, "freshness" | "error">;
  readonly compact?: boolean;
}

export function FreshnessNote({ meta, compact = false }: FreshnessNoteProps) {
  const Icon = meta.freshness === "fresh" ? CircleCheck : AlertTriangle;
  const text = meta.error ?? labels[meta.freshness];

  return (
    <p
      className={`freshness-note freshness-note--${meta.freshness}${compact ? " freshness-note--compact" : ""}`}
      title={meta.error}
    >
      <Icon aria-hidden="true" size={compact ? 13 : 14} strokeWidth={1.8} />
      <span>{text}</span>
    </p>
  );
}
