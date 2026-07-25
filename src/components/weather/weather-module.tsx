import {
  ArrowDown,
  ArrowUp,
  CloudRain,
  Navigation,
  Sunrise,
  Sunset,
  ThermometerSun,
} from "lucide-react";

import type { WeatherView } from "../dashboard-types";
import { LocalTime } from "../layout/local-time";
import { FreshnessNote } from "../ui/freshness-note";
import { WeatherIcon } from "../ui/weather-icon";

interface WeatherModuleProps {
  readonly weather: WeatherView;
  readonly refreshState?: {
    readonly state: "idle" | "loading" | "success" | "error";
    readonly message?: string;
  };
}

export function WeatherModule({ refreshState, weather }: WeatherModuleProps) {
  return (
    <section className="module weather-module" aria-labelledby="weather-heading">
      <header className="module-header">
        <div>
          <p className="section-kicker">Local outlook</p>
          <h2 id="weather-heading">Weather</h2>
        </div>
        <div className="module-source">
          <span>{weather.source.name}</span>
          <FreshnessNote meta={weather} compact />
        </div>
      </header>

      <div
        className={`weather-refresh weather-refresh--${refreshState?.state ?? "idle"}`}
        aria-live="polite"
      >
        <span className="weather-refresh-pulse" aria-hidden="true" />
        <span>{refreshState?.message ?? ""}</span>
      </div>

      <div className="weather-current">
        <div className="weather-primary">
          <WeatherIcon
            code={weather.conditionCode}
            className="weather-primary-icon"
            label={weather.condition}
          />
          <div>
            <p className="current-temperature">{Math.round(weather.temperature)}°</p>
            <p className="current-condition">{weather.condition}</p>
          </div>
        </div>

        <div className="weather-range" aria-label="Today’s high and low">
          <span>
            <ArrowUp aria-hidden="true" size={14} />
            <strong>{Math.round(weather.high)}°</strong>
            High
          </span>
          <span>
            <ArrowDown aria-hidden="true" size={14} />
            <strong>{Math.round(weather.low)}°</strong>
            Low
          </span>
        </div>
      </div>

      <dl className="weather-details">
        <div>
          <dt>
            <ThermometerSun aria-hidden="true" size={16} />
            Feels like
          </dt>
          <dd>{Math.round(weather.feelsLike)}°</dd>
        </div>
        <div>
          <dt>
            <CloudRain aria-hidden="true" size={16} />
            Precipitation
          </dt>
          <dd>{Math.round(weather.precipitationProbability)}%</dd>
        </div>
        <div>
          <dt>
            <Navigation aria-hidden="true" size={15} />
            Wind
          </dt>
          <dd>
            {weather.windDirection ? `${weather.windDirection} ` : ""}
            {Math.round(weather.windSpeed)} km/h
          </dd>
        </div>
        <div>
          <dt>
            <Sunrise aria-hidden="true" size={16} />
            Sunrise
          </dt>
          <dd>
            <LocalTime iso={weather.sunrise} mode="time" />
          </dd>
        </div>
        <div>
          <dt>
            <Sunset aria-hidden="true" size={16} />
            Sunset
          </dt>
          <dd>
            <LocalTime iso={weather.sunset} mode="time" />
          </dd>
        </div>
      </dl>

      <ol className="forecast-strip" aria-label="Five-day forecast">
        {weather.forecast.slice(0, 5).map((day) => (
          <li key={day.date}>
            <p className="forecast-day">{day.label}</p>
            <WeatherIcon code={day.conditionCode} label={day.condition} />
            <p className="forecast-condition">{day.condition}</p>
            <p className="forecast-temperatures">
              <strong>{Math.round(day.high)}°</strong>
              <span>{Math.round(day.low)}°</span>
            </p>
            <p className="forecast-rain">
              <CloudRain aria-hidden="true" size={11} />
              {Math.round(day.precipitationProbability)}%
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
