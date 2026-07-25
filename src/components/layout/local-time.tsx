"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  readonly iso: string;
  readonly prefix?: string;
  readonly mode?: "date" | "date-time" | "relative" | "time";
  readonly className?: string;
}

function formatRelative(iso: string): string {
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (elapsedMinutes < 1) return "just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatLocal(iso: string, mode: NonNullable<LocalTimeProps["mode"]>): string {
  const date = new Date(iso);

  if (mode === "relative") return formatRelative(iso);
  if (mode === "date") {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "long",
      weekday: "long",
    }).format(date);
  }
  if (mode === "time") {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

export function LocalTime({
  iso,
  prefix = "",
  mode = "relative",
  className,
}: LocalTimeProps) {
  const [value, setValue] = useState("Recently");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setValue(formatLocal(iso, mode)));
    return () => window.cancelAnimationFrame(frame);
  }, [iso, mode]);

  return (
    <time className={className} dateTime={iso}>
      {prefix}
      {value}
    </time>
  );
}
