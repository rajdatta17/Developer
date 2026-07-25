import { z } from "zod";

import { freshnessStatusSchema, isoTimestampSchema } from "./source";

export const intelligenceTopicSchema = z.enum([
  "weather",
  "cricket",
  "football",
]);

export const rankedIntelligenceItemSchema = z.object({
  id: z.string().min(1),
  rank: z.number().int().min(1).max(3),
  topic: intelligenceTopicSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  significance: z.number().min(0).max(100),
  timestamp: isoTimestampSchema,
});

export const briefingInputSchema = z.object({
  topic: intelligenceTopicSchema,
  freshness: freshnessStatusSchema,
  generatedAt: isoTimestampSchema,
});

export const briefingContentSchema = z.object({
  sentences: z.array(z.string().min(1)).min(3).max(6),
  worthKnowing: z.array(rankedIntelligenceItemSchema).max(3),
  inputs: z.array(briefingInputSchema),
});

export type IntelligenceTopic = z.infer<typeof intelligenceTopicSchema>;
export type RankedIntelligenceItem = z.infer<
  typeof rankedIntelligenceItemSchema
>;
export type BriefingInput = z.infer<typeof briefingInputSchema>;
export type BriefingContent = z.infer<typeof briefingContentSchema>;

