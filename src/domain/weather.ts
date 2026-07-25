import { z } from "zod";

import { isoTimestampSchema } from "./source";

export const locationSchema = z.object({
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1),
});

export const weatherConditionSchema = z.object({
  code: z.number().int(),
  label: z.string().min(1),
  icon: z.enum([
    "clear",
    "partly-cloudy",
    "cloudy",
    "fog",
    "drizzle",
    "rain",
    "snow",
    "storm",
  ]),
});

export const currentWeatherSchema = z.object({
  observedAt: isoTimestampSchema,
  temperatureC: z.number(),
  feelsLikeC: z.number(),
  highC: z.number(),
  lowC: z.number(),
  precipitationProbability: z.number().min(0).max(100),
  windSpeedKph: z.number().nonnegative(),
  windDirectionDegrees: z.number().min(0).max(360),
  condition: weatherConditionSchema,
  sunrise: isoTimestampSchema,
  sunset: isoTimestampSchema,
  isDay: z.boolean(),
});

export const forecastDaySchema = z.object({
  date: z.string().date(),
  highC: z.number(),
  lowC: z.number(),
  precipitationProbability: z.number().min(0).max(100),
  condition: weatherConditionSchema,
  sunrise: isoTimestampSchema,
  sunset: isoTimestampSchema,
});

export const weatherContentSchema = z.object({
  location: locationSchema,
  current: currentWeatherSchema,
  forecast: z.array(forecastDaySchema).min(1).max(10),
});

export type Location = z.infer<typeof locationSchema>;
export type WeatherCondition = z.infer<typeof weatherConditionSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type ForecastDay = z.infer<typeof forecastDaySchema>;
export type WeatherContent = z.infer<typeof weatherContentSchema>;

