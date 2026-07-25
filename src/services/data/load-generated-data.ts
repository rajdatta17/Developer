import { readFileSync } from "node:fs";
import path from "node:path";

import {
  briefingDocumentSchema,
  cricketDocumentSchema,
  dashboardDataSchema,
  footballDocumentSchema,
  statusDocumentSchema,
  weatherDocumentSchema,
  type DashboardData,
} from "@/domain/generated-data";
import type { z } from "zod";

function readJson(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read generated data at ${filePath}: ${message}`);
  }
}

function parseGeneratedFile<T>(
  directory: string,
  fileName: string,
  schema: z.ZodType<T>,
): T {
  const filePath = path.join(directory, fileName);
  try {
    return schema.parse(readJson(filePath));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Generated data is invalid at ${filePath}: ${message}`);
  }
}

export function loadDashboardData(
  directory = path.join(process.cwd(), "public", "data"),
): DashboardData {
  return dashboardDataSchema.parse({
    weather: parseGeneratedFile(
      directory,
      "weather.json",
      weatherDocumentSchema,
    ),
    cricket: parseGeneratedFile(
      directory,
      "cricket.json",
      cricketDocumentSchema,
    ),
    football: parseGeneratedFile(
      directory,
      "football.json",
      footballDocumentSchema,
    ),
    briefing: parseGeneratedFile(
      directory,
      "briefing.json",
      briefingDocumentSchema,
    ),
    status: parseGeneratedFile(
      directory,
      "status.json",
      statusDocumentSchema,
    ),
  });
}
