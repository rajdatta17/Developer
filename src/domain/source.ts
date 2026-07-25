import { z } from "zod";

export const isoTimestampSchema = z.string().datetime({ offset: true });

export const sourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  attribution: z.string().min(1),
});

export const freshnessStatusSchema = z.enum(["fresh", "stale", "expired"]);

export const freshnessSchema = z.object({
  status: freshnessStatusSchema,
  lastSuccessfulAt: isoTimestampSchema.nullable(),
  ageMinutes: z.number().nonnegative(),
  staleAfterMinutes: z.number().int().positive(),
  expiresAfterMinutes: z.number().int().positive(),
});

export const dataErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  occurredAt: isoTimestampSchema,
  retryable: z.boolean(),
});

export type DataSource = z.infer<typeof sourceSchema>;
export type Freshness = z.infer<typeof freshnessSchema>;
export type FreshnessStatus = z.infer<typeof freshnessStatusSchema>;
export type DataError = z.infer<typeof dataErrorSchema>;

