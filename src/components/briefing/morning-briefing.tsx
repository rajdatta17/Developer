import { ArrowDown, Droplets } from "lucide-react";

import type { BriefingView, WeatherView } from "../dashboard-types";
import { FreshnessNote } from "../ui/freshness-note";
import { WeatherIcon } from "../ui/weather-icon";
import { LocalTime } from "../layout/local-time";
import { ContextualGreeting } from "./contextual-greeting";

interface MorningBriefingProps {
  readonly briefing: BriefingView;
  readonly weather: WeatherView;
  readonly usesDemonstrationSports?: boolean;
}

export function MorningBriefing({
  briefing,
  usesDemonstrationSports = false,
  weather,
}: MorningBriefingProps) {
  const atmosphere = weather.conditionCode.toLowerCase().replaceAll(/[^a-z]+/g, "-");

  return (
    <section
      className={`briefing-hero atmosphere atmosphere--${atmosphere}`}
      aria-labelledby="briefing-heading"
    >
      <div className="atmosphere-orb atmosphere-orb--one" aria-hidden="true" />
      <div className="atmosphere-orb atmosphere-orb--two" aria-hidden="true" />

      <div className="briefing-copy">
        <p className="briefing-greeting">
          <ContextualGreeting fallback={briefing.greeting} />
        </p>
        <p className="section-kicker">Your morning intelligence</p>
        <h1 id="briefing-heading">Morning Briefing</h1>
        <p className="briefing-text">{briefing.sentences.join(" ")}</p>
        <div className="briefing-meta">
          <LocalTime iso={briefing.generatedAt} prefix="Updated " mode="relative" />
          <span aria-hidden="true">•</span>
          <span>{briefing.source.name}</span>
          {usesDemonstrationSports ? (
            <span className="demo-briefing-note">Sports feeds are demonstration data</span>
          ) : null}
          {briefing.freshness !== "fresh" ? <FreshnessNote meta={briefing} compact /> : null}
        </div>
      </div>

      <aside className="briefing-weather" aria-label={`${weather.location} weather overview`}>
        <div className="briefing-weather-now">
          <WeatherIcon code={weather.conditionCode} className="briefing-weather-icon" />
          <div>
            <span className="briefing-temperature">{Math.round(weather.temperature)}°</span>
            <span className="briefing-condition">{weather.condition}</span>
          </div>
        </div>
        <div className="briefing-weather-facts">
          <span>
            <ArrowDown aria-hidden="true" size={13} />
            {Math.round(weather.low)}° low
          </span>
          <span>
            <Droplets aria-hidden="true" size={13} />
            {Math.round(weather.precipitationProbability)}%
          </span>
        </div>
        <ol className="briefing-forecast">
          {weather.forecast.slice(0, 5).map((day) => (
            <li key={day.date}>
              <span>{day.label}</span>
              <WeatherIcon code={day.conditionCode} label={day.condition} />
              <span className="forecast-rail-temp">
                <strong>{Math.round(day.high)}°</strong>
                <span>{Math.round(day.low)}°</span>
              </span>
            </li>
          ))}
        </ol>
      </aside>
    </section>
  );
}
