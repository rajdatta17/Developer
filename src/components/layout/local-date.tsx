"use client";

import { useEffect, useState } from "react";

export function LocalDate() {
  const [label, setLabel] = useState("Today");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLabel(
        new Intl.DateTimeFormat(undefined, {
          day: "numeric",
          month: "long",
          weekday: "long",
        }).format(new Date()),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return <span className="header-date">{label}</span>;
}
