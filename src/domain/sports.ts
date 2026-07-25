import { z } from "zod";

import { isoTimestampSchema } from "./source";

export const matchStatusSchema = z.enum(["live", "upcoming", "completed"]);

export const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
});

export const scoreSchema = z.object({
  home: z.string().min(1),
  away: z.string().min(1),
});

export const matchSchema = z.object({
  id: z.string().min(1),
  sport: z.enum(["cricket", "football"]),
  competition: z.string().min(1),
  competitionContext: z.string().min(1).optional(),
  homeTeam: teamSchema,
  awayTeam: teamSchema,
  startTime: isoTimestampSchema,
  status: matchStatusSchema,
  statusText: z.string().min(1),
  score: scoreSchema.nullable(),
  narrative: z.string().min(1).optional(),
  significance: z.number().min(0).max(100),
  lastUpdatedAt: isoTimestampSchema,
});

export const sportContentSchema = z.object({
  items: z.array(matchSchema),
  leadingHeadline: z.string().min(1).optional(),
});

export type MatchStatus = z.infer<typeof matchStatusSchema>;
export type Team = z.infer<typeof teamSchema>;
export type Match = z.infer<typeof matchSchema>;
export type SportContent = z.infer<typeof sportContentSchema>;

