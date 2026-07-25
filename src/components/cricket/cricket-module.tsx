import type { SportsView } from "../dashboard-types";
import { SportsModule } from "../ui/sports-module";

interface CricketModuleProps {
  readonly data: SportsView;
}

export function CricketModule({ data }: CricketModuleProps) {
  return (
    <SportsModule
      className="cricket-module"
      data={data}
      id="cricket-heading"
      kicker="Across the crease"
      title="Cricket"
      emptyTitle="The field is quiet"
      emptyDetail="No live, upcoming, or recent matches are in this briefing window."
    />
  );
}
