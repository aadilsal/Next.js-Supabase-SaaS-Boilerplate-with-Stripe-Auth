import { beforeAll, describe, expect, it, vi } from "vitest";

// Price IDs are read from env when the billing config module loads.
beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY", "price_pro_month");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY", "price_pro_year");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PRICE_LIFETIME", "price_lifetime");
});

async function load() {
  vi.resetModules();
  return import("./entitlements");
}

const subscription = (status: string, price_id: string) => ({
  id: "sub_1",
  status,
  price_id,
  interval: "month",
  current_period_end: null,
  cancel_at_period_end: false,
});

describe("resolveEntitlements", () => {
  it("defaults to the free plan", async () => {
    const { resolveEntitlements } = await load();
    const result = resolveEntitlements({ subscriptions: [], purchases: [] });
    expect(result.plan.id).toBe("free");
    expect(result.source).toBe("free");
  });

  it("uses an active subscription", async () => {
    const { resolveEntitlements, hasEntitlement } = await load();
    const result = resolveEntitlements({
      subscriptions: [subscription("active", "price_pro_year")],
      purchases: [],
    });
    expect(result.plan.id).toBe("pro");
    expect(result.source).toBe("subscription");
    expect(hasEntitlement(result, "advanced_analytics")).toBe(true);
    expect(hasEntitlement(result, "api_access")).toBe(false);
  });

  it("ignores canceled subscriptions", async () => {
    const { resolveEntitlements } = await load();
    const result = resolveEntitlements({
      subscriptions: [subscription("canceled", "price_pro_month")],
      purchases: [],
    });
    expect(result.plan.id).toBe("free");
  });

  it("uses a paid lifetime purchase", async () => {
    const { resolveEntitlements } = await load();
    const result = resolveEntitlements({
      subscriptions: [],
      purchases: [{ price_id: "price_lifetime", status: "paid" }],
    });
    expect(result.plan.id).toBe("lifetime");
    expect(result.limits.members).toBeNull();
  });

  it("ignores refunded purchases and unknown prices", async () => {
    const { resolveEntitlements } = await load();
    const result = resolveEntitlements({
      subscriptions: [subscription("active", "price_unknown")],
      purchases: [{ price_id: "price_lifetime", status: "refunded" }],
    });
    expect(result.plan.id).toBe("free");
  });
});
