import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "whsec_test_secret";

// Shared state for the mocks below (vi.mock factories are hoisted).
const db = vi.hoisted(() => ({
  insertError: null as { code: string } | null,
  deletedEventIds: [] as string[],
  handleStripeEvent: vi.fn(),
}));

vi.mock("@/env", () => ({
  serverEnv: () => ({ STRIPE_SECRET_KEY: "sk_test_123", STRIPE_WEBHOOK_SECRET: "whsec_test_secret" }),
  // Keeps the logger from trying to store entries during this test.
  isSupabaseConfigured: () => false,
}));

vi.mock("@/lib/stripe", async () => {
  const { default: StripeSdk } = await import("stripe");
  const client = new StripeSdk("sk_test_123");
  return { getStripe: () => client };
});

vi.mock("@/features/billing/webhooks/handlers", () => ({
  handleStripeEvent: db.handleStripeEvent,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: async () => ({ error: db.insertError }),
      delete: () => ({
        eq: async (_column: string, id: string) => {
          db.deletedEventIds.push(id);
          return { error: null };
        },
      }),
    }),
  }),
}));

const signer = new Stripe("sk_test_123");

function webhookRequest(payload: string, signature?: string) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: payload,
    headers: signature ? { "stripe-signature": signature } : {},
  });
}

function signedRequest(event: object) {
  const payload = JSON.stringify(event);
  const signature = signer.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  return webhookRequest(payload, signature);
}

const event = {
  id: "evt_test_1",
  object: "event",
  type: "customer.subscription.updated",
  data: { object: { id: "sub_test_1" } },
};

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    db.insertError = null;
    db.deletedEventIds = [];
    db.handleStripeEvent.mockReset();
  });

  async function post(request: Request) {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    return POST(request);
  }

  it("rejects requests without a signature", async () => {
    const response = await post(webhookRequest(JSON.stringify(event)));
    expect(response.status).toBe(400);
    expect(db.handleStripeEvent).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid signature", async () => {
    const response = await post(webhookRequest(JSON.stringify(event), "t=1,v1=bogus"));
    expect(response.status).toBe(400);
    expect(db.handleStripeEvent).not.toHaveBeenCalled();
  });

  it("processes a valid event once", async () => {
    const response = await post(signedRequest(event));
    expect(response.status).toBe(200);
    expect(db.handleStripeEvent).toHaveBeenCalledTimes(1);
    expect(db.handleStripeEvent.mock.calls[0][0].id).toBe("evt_test_1");
  });

  it("skips duplicate events", async () => {
    db.insertError = { code: "23505" };
    const response = await post(signedRequest(event));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ duplicate: true });
    expect(db.handleStripeEvent).not.toHaveBeenCalled();
  });

  it("forgets the event when the handler fails, so Stripe's retry is processed", async () => {
    db.handleStripeEvent.mockRejectedValueOnce(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await post(signedRequest(event));
    expect(response.status).toBe(500);
    expect(db.deletedEventIds).toEqual(["evt_test_1"]);
  });
});
