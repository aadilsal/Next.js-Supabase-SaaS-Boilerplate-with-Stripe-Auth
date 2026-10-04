import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  inserted: [] as Record<string, unknown>[],
  captureException: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: mocks.captureException,
  addBreadcrumb: vi.fn(),
}));

vi.mock("next/server", () => ({
  // Outside a request `after` throws, so the logger writes immediately.
  after: () => {
    throw new Error("outside request scope");
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: async (row: Record<string, unknown>) => {
        mocks.inserted.push(row);
        return { error: null };
      },
    }),
  }),
}));

import { logger, serializeError } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    // The logger only stores entries once Supabase is configured.
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-test-key");
    mocks.inserted.length = 0;
    mocks.captureException.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("prints one JSON line per entry", () => {
    logger.warn("auth.sign_in_failed", { email: "a@b.com" });
    const line = vi.mocked(console.warn).mock.calls[0][0] as string;
    expect(JSON.parse(line)).toMatchObject({ level: "warn", event: "auth.sign_in_failed", email: "a@b.com" });
  });

  it("sends errors to Sentry and stores them", async () => {
    const error = new Error("boom");
    logger.error("stripe.webhook_failed", { error, eventId: "evt_1", teamId: "t1" });
    await vi.waitFor(() => expect(mocks.inserted).toHaveLength(1));
    expect(mocks.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ tags: { event: "stripe.webhook_failed" } }),
    );
    expect(mocks.inserted[0]).toMatchObject({
      level: "error",
      event: "stripe.webhook_failed",
      team_id: "t1",
      context: { eventId: "evt_1" },
      error: { name: "Error", message: "boom" },
    });
  });

  it("does not store info logs (below databaseLogLevel)", async () => {
    logger.info("team.created");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mocks.inserted).toHaveLength(0);
  });

  it("skips the database when Supabase isn't configured yet", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    logger.error("build.something_failed", { error: new Error("boom") });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mocks.inserted).toHaveLength(0);
  });

  it("serializes Supabase-style error objects", () => {
    expect(serializeError({ message: "duplicate key", code: "23505" })).toEqual({
      name: "Error",
      message: "duplicate key",
      code: "23505",
    });
  });
});
