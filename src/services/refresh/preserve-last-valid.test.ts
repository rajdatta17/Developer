import { cricketDocumentSchema } from "@/domain/generated-data";
import type { CricketProvider } from "@/providers/contracts";
import { createCricketDocument } from "@/test/factories";

import { refreshProvider } from "./preserve-last-valid";

describe("refreshProvider", () => {
  it("retains prior items when the latest provider call fails", async () => {
    const previous = createCricketDocument();
    const provider: CricketProvider = {
      id: "failing-cricket",
      source: previous.source,
      async fetch() {
        throw new Error("quota unavailable");
      },
      parseAndNormalize() {
        throw new Error("not reached");
      },
    };

    const result = await refreshProvider({
      provider,
      previous,
      schema: cricketDocumentSchema,
      policy: { staleAfterMinutes: 180, expiresAfterMinutes: 720 },
      now: new Date("2026-07-25T14:00:00.000Z"),
      createDocument: (content, metadata) => ({ ...metadata, ...content }),
    });

    expect(result.providerState).toBe("degraded");
    expect(result.document.items).toEqual(previous.items);
    expect(result.document.generatedAt).toBe(previous.generatedAt);
    expect(result.document).toMatchObject({
      error: { message: expect.stringContaining("quota unavailable") },
    });
  });
});
