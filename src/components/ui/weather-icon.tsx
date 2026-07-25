import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";

interface WeatherIconProps {
  readonly code: string;
  readonly className?: string;
  readonly label?: string;
}

export function WeatherIcon({ code, className, label }: WeatherIconProps) {
  const commonProps = {
    "aria-hidden": label ? undefined : true,
    "aria-label": label,
    className,
    role: label ? ("img" as const) : undefined,
    strokeWidth: 1.55,
  };

  if (code.includes("thunder")) return <CloudLightning {...commonProps} />;
  if (code.includes("snow")) return <CloudSnow {...commonProps} />;
  if (code.includes("rain") || code.includes("drizzle")) {
    return <CloudRain {...commonProps} />;
  }
  if (code.includes("fog") || code.includes("mist")) {
    return <CloudFog {...commonProps} />;
  }
  if (code.includes("partly") || code.includes("cloud")) {
    return code.includes("night") ? (
      <Cloud {...commonProps} />
    ) : (
      <CloudSun {...commonProps} />
    );
  }
  if (code.includes("night")) return <Moon {...commonProps} />;
  return <Sun {...commonProps} />;
}
