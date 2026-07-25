import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  description: "A calm morning intelligence briefing for weather, cricket, and football.",
  title: "Daybreak — Morning Intelligence",
};

const themeScript = `
try {
  const stored = localStorage.getItem('daybreak-theme');
  const theme = stored === 'light' || stored === 'dark'
    ? stored
    : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
} catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
