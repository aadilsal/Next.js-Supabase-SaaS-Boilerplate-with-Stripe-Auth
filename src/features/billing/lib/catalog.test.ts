import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import type { PlanPrice } from "@/config/billing";
import { resolveDisplayPrice, toPriceRow, toProductRow } from "./catalog";

const configured: PlanPrice = { interval: "month", priceId: "price_pro", amount: 19 };

describe("resolveDisplayPrice", () => {
  it("falls back to the config amount when the catalog is empty", () => {
    expect(resolveDisplayPrice(configured, {}, "usd")).toEqual({ amount: 19, currency: "usd", available: true });
  });

  it("prefers the live Stripe amount", () => {
    const catalog = { price_pro: { active: true, unitAmount: 2900, currency: "eur" } };
    expect(resolveDisplayPrice(configured, catalog, "usd")).toEqual({ amount: 29, currency: "eur", available: true });
  });

  it("handles zero-decimal currencies", () => {
    const catalog = { price_pro: { active: true, unitAmount: 3000, currency: "jpy" } };
    expect(resolveDisplayPrice(configured, catalog, "usd").amount).toBe(3000);
  });

  it("marks archived prices as unavailable", () => {
    const catalog = { price_pro: { active: false, unitAmount: 1900, currency: "usd" } };
    expect(resolveDisplayPrice(configured, catalog, "usd").available).toBe(false);
  });
});

describe("catalog row mappers", () => {
  it("maps a Stripe product", () => {
    const product = { id: "prod_1", active: true, name: "Pro", description: null, metadata: { tier: "pro" } };
    expect(toProductRow(product as unknown as Stripe.Product)).toEqual({
      id: "prod_1",
      active: true,
      name: "Pro",
      description: null,
      metadata: { tier: "pro" },
    });
  });

  it("maps a recurring Stripe price", () => {
    const price = {
      id: "price_1",
      product: "prod_1",
      active: true,
      currency: "usd",
      unit_amount: 1900,
      type: "recurring",
      recurring: { interval: "month", interval_count: 1, trial_period_days: null },
      metadata: {},
    };
    expect(toPriceRow(price as unknown as Stripe.Price)).toMatchObject({
      id: "price_1",
      product_id: "prod_1",
      type: "recurring",
      interval: "month",
      unit_amount: 1900,
    });
  });

  it("maps a one-time price with an expanded product", () => {
    const price = {
      id: "price_2",
      product: { id: "prod_2" },
      active: true,
      currency: "usd",
      unit_amount: 29900,
      type: "one_time",
      recurring: null,
      metadata: {},
    };
    expect(toPriceRow(price as unknown as Stripe.Price)).toMatchObject({
      product_id: "prod_2",
      type: "one_time",
      interval: null,
    });
  });
});
