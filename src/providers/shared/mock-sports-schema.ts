import { z } from "zod";

import { isoTimestampSchema } from "@/domain/source";

export const mockSportsPayloadSchema = z.object({
  generatedAt: isoTimestampSchema,
  headline: z.string().min(1).optional(),
  matches: z.array(
    z.object({
      id: z.string().min(1),
      competition: z.string().min(1),
      context: z.string().min(1).optional(),
      home: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        shortName: z.string().min(1),
      }),
      away: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        shortName: z.string().min(1),
      }),
      startsAt: isoTimestampSchema,
      state: z.enum(["LIVE", "SCHEDULED", "FINAL"]),
      statusText: z.string().min(1),
      homeScore: z.string().min(1).nullable(),
      awayScore: z.string().min(1).nullable(),
      narrative: z.string().min(1).optional(),
      importance: z.number().min(0).max(100),
      updatedAt: isoTimestampSchema,
    }),
  ),
});

export type MockSportsPayload = z.infer<typeof mockSportsPayloadSchema>;

