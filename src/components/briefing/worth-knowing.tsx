import { CloudSun, Goal, Trophy } from "lucide-react";

import type { IntelligenceTopic, WorthKnowingView } from "../dashboard-types";

const topicIcons: Record<IntelligenceTopic, typeof CloudSun> = {
  cricket: Trophy,
  football: Goal,
  weather: CloudSun,
};

interface WorthKnowingProps {
  readonly items: readonly WorthKnowingView[];
}

export function WorthKnowing({ items }: WorthKnowingProps) {
  if (items.length === 0) return null;

  return (
    <section className="worth-knowing" aria-labelledby="worth-knowing-heading">
      <header className="editorial-strip-header">
        <p className="section-kicker">Across your brief</p>
        <h2 id="worth-knowing-heading">Worth Knowing</h2>
      </header>

      <ol className="intelligence-list">
        {items.slice(0, 3).map((item, index) => {
          const Icon = topicIcons[item.topic];
          return (
            <li key={item.id} className="intelligence-item">
              <span className="intelligence-rank" aria-label={`Rank ${index + 1}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="intelligence-copy">
                <p className="intelligence-eyebrow">
                  <Icon aria-hidden="true" size={13} strokeWidth={1.7} />
                  {item.eyebrow}
                </p>
                <h3>{item.title}</h3>
                {item.detail ? <p>{item.detail}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
