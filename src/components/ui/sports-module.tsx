import { Check, Clock3, Radio, type LucideIcon } from "lucide-react";

import type { MatchState, MatchView, SportsView } from "../dashboard-types";
import { LocalTime } from "../layout/local-time";
import { FreshnessNote } from "./freshness-note";
import { ModuleState } from "./module-state";

const statusIcons: Record<MatchState, LucideIcon> = {
  completed: Check,
  live: Radio,
  upcoming: Clock3,
};

interface SportsModuleProps {
  readonly data: SportsView;
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly emptyTitle: string;
  readonly emptyDetail: string;
  readonly className: string;
}

function MatchRow({ match }: { readonly match: MatchView }) {
  const StatusIcon = statusIcons[match.status];
  const hasScores = match.home.score !== undefined || match.away.score !== undefined;

  return (
    <li className={`match-row match-row--${match.status}`}>
      <div className="match-context">
        <p className="match-competition">{match.competition}</p>
        <p className="match-status">
          <StatusIcon aria-hidden="true" size={12} strokeWidth={1.9} />
          <span>{match.statusText}</span>
          {match.status === "upcoming" ? (
            <LocalTime iso={match.startTime} mode="date-time" className="match-start" />
          ) : null}
        </p>
      </div>

      <div className="match-teams">
        <div className="match-team">
          <span className="team-name">{match.home.name}</span>
          {match.home.detail ? <span className="team-detail">{match.home.detail}</span> : null}
          {hasScores ? <strong className="team-score">{match.home.score ?? "—"}</strong> : null}
        </div>
        <div className="match-team">
          <span className="team-name">{match.away.name}</span>
          {match.away.detail ? <span className="team-detail">{match.away.detail}</span> : null}
          {hasScores ? <strong className="team-score">{match.away.score ?? "—"}</strong> : null}
        </div>
      </div>

      {match.narrative ? <p className="match-narrative">{match.narrative}</p> : null}
    </li>
  );
}

export function SportsModule({
  className,
  data,
  emptyDetail,
  emptyTitle,
  id,
  kicker,
  title,
}: SportsModuleProps) {
  const isDemonstration = data.source.name.toLowerCase().includes("demo");

  return (
    <section className={`module sports-module ${className}`} aria-labelledby={id}>
      <header className="module-header sports-header">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2 id={id}>{title}</h2>
        </div>
        <div className="module-source">
          <span>{data.source.name}</span>
          <FreshnessNote meta={data} compact />
        </div>
      </header>

      {isDemonstration ? (
        <p className="demo-disclosure">Demonstration data · Not current live fixtures</p>
      ) : null}

      {data.headline ? <p className="sports-headline">{data.headline}</p> : null}

      {data.matches.length > 0 ? (
        <ol className="match-list">
          {data.matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </ol>
      ) : (
        <ModuleState
          kind={data.error ? "error" : "empty"}
          title={data.error ? `${title} data unavailable` : emptyTitle}
          detail={data.error ?? emptyDetail}
        />
      )}
    </section>
  );
}
