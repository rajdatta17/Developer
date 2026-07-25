import { MapPin } from "lucide-react";

import type { DashboardStatusView, FreshnessState } from "../dashboard-types";
import { GeolocationControl } from "../weather/geolocation-control";
import { LocalDate } from "./local-date";
import { LocalTime } from "./local-time";
import { ThemeControl } from "./theme-control";

interface DashboardHeaderProps {
  readonly location: string;
  readonly status: DashboardStatusView;
  readonly freshness: FreshnessState;
}

export function DashboardHeader({ location, status, freshness }: DashboardHeaderProps) {
  return (
    <header className="site-header">
      <div className="header-brand">
        <a className="wordmark" href="#top" aria-label="Daybreak home">
          <span className="wordmark-mark" aria-hidden="true" />
          Daybreak
        </a>
        <span className="header-divider" aria-hidden="true" />
        <LocalDate />
      </div>

      <div className="header-context">
        <div className="location-cluster">
          <p className="header-location">
            <MapPin aria-hidden="true" size={14} strokeWidth={1.8} />
            <span>{location}</span>
          </p>
          <GeolocationControl />
        </div>

        <p className={`refresh-status refresh-status--${freshness}`}>
          <span className="status-dot" aria-hidden="true" />
          <span className="refresh-label">Updated </span>
          <LocalTime iso={status.lastAttemptAt} mode="relative" />
        </p>
        <ThemeControl />
      </div>
    </header>
  );
}
