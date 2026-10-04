import type Stripe from "stripe";
import type { PlanPrice } from "@/config/billing";
import type { TablesInsert } from "@/types/database";

/**
 * Product catalog helpers. Pure functions shared by the Stripe webhook and
 * `pnpm stripe:sync`, so both write rows in exactly the same shape.
 */

export function toProductRow(product: Stripe.Product): TablesInsert<"products"> {
  return {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    metadata: product.metadata,
  };
}

export function toPriceRow(price: Stripe.Price): TablesInsert<"prices"> {
  return {
    id: price.id,
    product_id: typeof price.product === "string" ? price.product : price.product.id,
    active: price.active,
    currency: price.currency,
    unit_amount: price.unit_amount,
    type: price.type,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata,
  };
}

/** Live price info keyed by Stripe price ID, as read from the `prices` table. */
export type PriceCatalog = Record<string, { active: boolean; unitAmount: number | null; currency: string }>;

// Currencies Stripe stores without a minor unit (amount 500 = ¥500, not ¥5).
const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

/**
 * What to show on the pricing table for a configured price. The live Stripe
 * amount wins when the catalog has it; otherwise the `amount` from
 * src/config/billing.ts is used (e.g. before the first sync).
 */
export function resolveDisplayPrice(
  price: PlanPrice,
  catalog: PriceCatalog | undefined,
  defaultCurrency: string,
): { amount: number; currency: string; available: boolean } {
  const live = price.priceId ? catalog?.[price.priceId] : undefined;
  if (!live || live.unitAmount === null) {
    return { amount: price.amount, currency: live?.currency ?? defaultCurrency, available: live?.active ?? true };
  }
  const divisor = ZERO_DECIMAL_CURRENCIES.has(live.currency) ? 1 : 100;
  return { amount: live.unitAmount / divisor, currency: live.currency, available: live.active };
}
