"use client";

import { LocateFixed, LoaderCircle } from "lucide-react";
import { useState } from "react";

type GeolocationState = "idle" | "loading" | "success" | "error" | "unsupported";

export interface DaybreakLocationDetail {
  readonly latitude: number;
  readonly longitude: number;
}

declare global {
  interface WindowEventMap {
    "daybreak:location": CustomEvent<DaybreakLocationDetail>;
  }
}

export function GeolocationControl() {
  const [state, setState] = useState<GeolocationState>("idle");

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setState("unsupported");
      return;
    }

    setState("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        window.localStorage.setItem("daybreak-use-location", "true");
        window.dispatchEvent(
          new CustomEvent<DaybreakLocationDetail>("daybreak:location", {
            detail: { latitude: coords.latitude, longitude: coords.longitude },
          }),
        );
        setState("success");
      },
      () => setState("error"),
      { enableHighAccuracy: false, maximumAge: 900_000, timeout: 10_000 },
    );
  }

  const labels: Record<GeolocationState, string> = {
    error: "Location unavailable",
    idle: "Use my location",
    loading: "Finding location…",
    success: "Location enabled",
    unsupported: "Location unsupported",
  };

  return (
    <button
      className="location-button"
      type="button"
      onClick={requestLocation}
      disabled={state === "loading" || state === "success" || state === "unsupported"}
      aria-label={labels[state]}
      aria-live="polite"
    >
      {state === "loading" ? (
        <LoaderCircle className="spin" aria-hidden="true" size={14} />
      ) : (
        <LocateFixed aria-hidden="true" size={14} />
      )}
      <span>{labels[state]}</span>
    </button>
  );
}
