"use client";

import { useEffect, useState } from "react";

interface ContextualGreetingProps {
  readonly fallback?: string;
}

export function ContextualGreeting({ fallback = "Good morning" }: ContextualGreetingProps) {
  const [greeting, setGreeting] = useState(fallback);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hour = new Date().getHours();
      setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return <span>{greeting}</span>;
}
