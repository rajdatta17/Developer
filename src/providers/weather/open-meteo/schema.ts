import { z } from "zod";

const numericSeriesSchema = z.array(z.number());
const stringSeriesSchema = z.array(z.string());

export const openMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().min(1),
  utc_offset_seconds: z.number().int(),
  current: z.object({
    time: z.string().min(1),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    is_day: z.union([z.literal(0), z.literal(1)]),
    weather_code: z.number().int(),
    wind_speed_10m: z.number().nonnegative(),
    wind_direction_10m: z.number().min(0).max(360),
  }),
  daily: z.object({
    time: stringSeriesSchema,
    weather_code: numericSeriesSchema,
    temperature_2m_max: numericSeriesSchema,
    temperature_2m_min: numericSeriesSchema,
    precipitation_probability_max: numericSeriesSchema,
    sunrise: stringSeriesSchema,
    sunset: stringSeriesSchema,
  }),
});

export type OpenMeteoResponse = z.infer<typeof openMeteoResponseSchema>;

