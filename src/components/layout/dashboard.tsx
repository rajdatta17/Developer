"use client";

import { useEffect, useState } from "react";

import { createOpenMeteoProvider, openMeteoSource } from "@/providers/weather/open-meteo/adapter";

import { MorningBriefing } from "../briefing/morning-briefing";
import { WorthKnowing } from "../briefing/worth-knowing";
import { CricketModule } from "../cricket/cricket-module";
import { weatherContentToView } from "../dashboard-view-model";
import type { DashboardViewModel, FreshnessState } from "../dashboard-types";
import { FootballModule } from "../football/football-module";
import { WeatherModule } from "../weather/weather-module";
import { DashboardFooter } from "./dashboard-footer";
import { DashboardHeader } from "./dashboard-header";

const freshnessWeight: Record<FreshnessState, number> = {
  expired: 2,
  fresh: 0,
  stale: 1,
};

function overallFreshness(data: DashboardViewModel): FreshnessState {
  return [data.weather.freshness, data.cricket.freshness, data.football.freshness].reduce(
    (worst, current) => (freshnessWeight[current] > freshnessWeight[worst] ? current : worst),
    "fresh" as FreshnessState,
  );
}

interface DashboardProps {
  readonly data: DashboardViewModel;
}

export function Dashboard({ data }: DashboardProps) {
  const [weather, setWeather] = useState(data.weather);
  const [hasWeatherOverride, setHasWeatherOverride] = useState(false);
  const [weatherRefresh, setWeatherRefresh] = useState<{
    readonly state: "idle" | "loading" | "success" | "error";
    readonly message?: string;
  }>({ state: "idle" });

  useEffect(() => {
    let activeController: AbortController | undefined;

    async function refreshForLocation(event: WindowEventMap["daybreak:location"]) {
      activeController?.abort();
      activeController = new AbortController();
      setWeatherRefresh({ state: "loading", message: "Updating weather for your location…" });

      try {
        const provider = createOpenMeteoProvider({
          latitude: event.detail.latitude,
          locationName: "Current location",
          longitude: event.detail.longitude,
          timezone: "auto",
        });
        const payload = await provider.fetch(activeController.signal);
        const content = provider.parseAndNormalize(payload);
        const generatedAt = new Date().toISOString();
        setWeather(
          weatherContentToView(content, {
            freshness: "fresh",
            generatedAt,
            source: { name: openMeteoSource.name, url: openMeteoSource.url },
          }),
        );
        setHasWeatherOverride(true);
        setWeatherRefresh({ state: "success", message: "Updated for your current location" });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setWeatherRefresh({
          state: "error",
          message: `Couldn’t load local weather. Showing ${data.weather.location}.`,
        });
      }
    }

    window.addEventListener("daybreak:location", refreshForLocation);
    return () => {
      activeController?.abort();
      window.removeEventListener("daybreak:location", refreshForLocation);
    };
  }, [data.weather.location]);

  const currentData = { ...data, weather };
  const briefing = hasWeatherOverride
    ? {
        ...data.briefing,
        generatedAt: weather.generatedAt,
        sentences: [
          `${weather.condition} conditions lead the day at your current location, with a high near ${Math.round(weather.high)}°C and a ${Math.round(weather.precipitationProbability)}% chance of precipitation.`,
          ...data.briefing.sentences.slice(1),
        ],
      }
    : data.briefing;
  const usesDemonstrationSports = [data.cricket.source.name, data.football.source.name].some(
    (name) => name.toLowerCase().includes("demo"),
  );

  return (
    <div className={`dashboard-page weather-${weather.conditionCode}`} id="top">
      <a className="skip-link" href="#main-content">
        Skip to briefing
      </a>
      <div className="page-frame">
        <DashboardHeader
          location={weather.location}
          status={data.status}
          freshness={overallFreshness(currentData)}
        />

        <main id="main-content">
          <MorningBriefing
            briefing={briefing}
            weather={weather}
            usesDemonstrationSports={usesDemonstrationSports}
          />

          <div className="dashboard-grid">
            <WeatherModule weather={weather} refreshState={weatherRefresh} />
            <CricketModule data={data.cricket} />
            <FootballModule data={data.football} />
          </div>

          <WorthKnowing items={data.briefing.worthKnowing} />
        </main>

        <DashboardFooter data={currentData} />
      </div>
    </div>
  );
}
