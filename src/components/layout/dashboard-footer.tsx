import { ExternalLink } from "lucide-react";

import type { DashboardViewModel } from "../dashboard-types";
import { LocalTime } from "./local-time";

interface DashboardFooterProps {
  readonly data: DashboardViewModel;
}

export function DashboardFooter({ data }: DashboardFooterProps) {
  const sources = [data.weather.source, data.cricket.source, data.football.source].filter(
    (source, index, all) => all.findIndex((candidate) => candidate.name === source.name) === index,
  );

  return (
    <footer className="site-footer">
      <p>
        Sources{" "}
        {sources.map((source, index) => (
          <span key={source.name}>
            {index > 0 ? ", " : ""}
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.name}
              </a>
            ) : (
              source.name
            )}
          </span>
        ))}
      </p>
      <p>
        Refreshed <LocalTime iso={data.status.lastAttemptAt} mode="date-time" />
      </p>
      {data.projectUrl ? (
        <a className="project-link" href={data.projectUrl} target="_blank" rel="noreferrer">
          Project
          <ExternalLink aria-hidden="true" size={12} />
        </a>
      ) : null}
    </footer>
  );
}
