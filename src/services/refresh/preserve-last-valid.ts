import type { z } from "zod";

import type { DataError, DataSource, Freshness } from "@/domain/source";
import type { ProviderAdapter } from "@/providers/contracts";
import {
  evaluateFreshness,
  type FreshnessPolicy,
} from "@/services/freshness/evaluate-freshness";

export interface RefreshDocumentBase {
  schemaVersion: 1;
  generatedAt: string;
  lastAttemptAt: string;
  source: DataSource;
  freshness: Freshness;
  error?: DataError;
}

export interface RefreshResult<TDocument extends RefreshDocumentBase> {
  document: TDocument;
  providerState: "ok" | "degraded" | "failed";
  message?: string;
}

interface RefreshProviderOptions<TContent, TDocument extends RefreshDocumentBase> {
  provider: ProviderAdapter<TContent>;
  previous: TDocument | undefined;
  schema: z.ZodType<TDocument>;
  policy: FreshnessPolicy;
  now: Date;
  timeoutMs?: number;
  createDocument: (
    content: TContent,
    metadata: Omit<RefreshDocumentBase, "error">,
  ) => TDocument;
}

function errorDetails(error: unknown, occurredAt: string): DataError {
  const message = error instanceof Error ? error.message : String(error);
  return {
    code: error instanceof DOMException && error.name === "AbortError"
      ? "PROVIDER_TIMEOUT"
      : "PROVIDER_REFRESH_FAILED",
    message,
    occurredAt,
    retryable: true,
  };
}

export async function refreshProvider<
  TContent,
  TDocument extends RefreshDocumentBase,
>(
  options: RefreshProviderOptions<TContent, TDocument>,
): Promise<RefreshResult<TDocument>> {
  const attemptedAt = options.now.toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 15_000,
  );

  try {
    const rawPayload = await options.provider.fetch(controller.signal);
    const content = options.provider.parseAndNormalize(rawPayload);
    const document = options.createDocument(content, {
      schemaVersion: 1,
      generatedAt: attemptedAt,
      lastAttemptAt: attemptedAt,
      source: options.provider.source,
      freshness: evaluateFreshness(attemptedAt, options.now, options.policy),
    });
    return {
      document: options.schema.parse(document),
      providerState: "ok",
    };
  } catch (error) {
    if (!options.previous) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `${options.provider.id} failed and no valid prior data is available: ${message}`,
      );
    }
    const freshness = evaluateFreshness(
      options.previous.generatedAt,
      options.now,
      options.policy,
    );
    const retained = options.schema.parse({
      ...options.previous,
      lastAttemptAt: attemptedAt,
      freshness,
      error: errorDetails(error, attemptedAt),
    });
    return {
      document: retained,
      providerState: freshness.status === "expired" ? "failed" : "degraded",
      message: retained.error?.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

