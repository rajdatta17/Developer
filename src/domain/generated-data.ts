import { z } from "zod";

import { briefingContentSchema } from "./briefing";
import {
  dataErrorSchema,
  freshnessSchema,
  isoTimestampSchema,
  sourceSchema,
} from "./source";
import { sportContentSchema } from "./sports";
import { weatherContentSchema } from "./weather";

const envelopeMetadataShape = {
  schemaVersion: z.literal(1),
  generatedAt: isoTimestampSchema,
  lastAttemptAt: isoTimestampSchema,
  source: sourceSchema,
  freshness: freshnessSchema,
  error: dataErrorSchema.optional(),
};

export const weatherDocumentSchema = z.object({
  ...envelopeMetadataShape,
  weather: weatherContentSchema,
});

export const cricketDocumentSchema = z.object({
  ...envelopeMetadataShape,
  items: sportContentSchema.shape.items,
  leadingHeadline: sportContentSchema.shape.leadingHeadline,
});

export const footballDocumentSchema = z.object({
  ...envelopeMetadataShape,
  items: sportContentSchema.shape.items,
  leadingHeadline: sportContentSchema.shape.leadingHeadline,
});

export const briefingDocumentSchema = z.object({
  ...envelopeMetadataShape,
  briefing: briefingContentSchema,
});

export const providerRefreshStatusSchema = z.object({
  provider: z.string().min(1),
  state: z.enum(["ok", "degraded", "failed"]),
  lastAttemptAt: isoTimestampSchema,
  lastSuccessfulAt: isoTimestampSchema.nullable(),
  message: z.string().min(1).optional(),
});

export const statusDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: isoTimestampSchema,
  source: sourceSchema,
  overall: z.enum(["ok", "degraded", "failed"]),
  items: z.array(providerRefreshStatusSchema),
});

export const dashboardDataSchema = z.object({
  weather: weatherDocumentSchema,
  cricket: cricketDocumentSchema,
  football: footballDocumentSchema,
  briefing: briefingDocumentSchema,
  status: statusDocumentSchema,
});

export type WeatherDocument = z.infer<typeof weatherDocumentSchema>;
export type CricketDocument = z.infer<typeof cricketDocumentSchema>;
export type FootballDocument = z.infer<typeof footballDocumentSchema>;
export type BriefingDocument = z.infer<typeof briefingDocumentSchema>;
export type ProviderRefreshStatus = z.infer<
  typeof providerRefreshStatusSchema
>;
export type StatusDocument = z.infer<typeof statusDocumentSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;

