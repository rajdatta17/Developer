import { ModuleSkeleton } from "../components/ui/module-skeleton";

export default function Loading() {
  return (
    <div className="dashboard-page">
      <div className="page-frame loading-page">
        <div className="loading-header" aria-hidden="true" />
        <section className="briefing-hero loading-hero">
          <ModuleSkeleton lines={4} label="Loading morning briefing" />
        </section>
        <div className="dashboard-grid">
          {["weather", "cricket", "football"].map((module) => (
            <section className={`module ${module}-module`} key={module}>
              <ModuleSkeleton lines={5} label={`Loading ${module}`} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
