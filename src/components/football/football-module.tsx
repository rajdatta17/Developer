import type { SportsView } from "../dashboard-types";
import { SportsModule } from "../ui/sports-module";

interface FootballModuleProps {
  readonly data: SportsView;
}

export function FootballModule({ data }: FootballModuleProps) {
  return (
    <SportsModule
      className="football-module"
      data={data}
      id="football-heading"
      kicker="On the pitch"
      title="Football"
      emptyTitle="Between fixtures"
      emptyDetail="No live, upcoming, or recent matches are in this briefing window."
    />
  );
}
