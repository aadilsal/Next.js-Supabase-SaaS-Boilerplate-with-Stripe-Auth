/**
 * Plans, prices and what each plan unlocks.
 *
 * Stripe is the source of truth for prices and payments.
 * This file is the source of truth for what each plan *unlocks*.
 *
 * To add or change a plan:
 *  1. Create the Product + Price in the Stripe dashboard.
 *  2. Put the Price ID in .env.local (NEXT_PUBLIC_STRIPE_PRICE_*).
 *  3. Edit the plan below. `amount` is for display only; keep it in sync with Stripe.
 */

/**
 * Feature keys your code can check with `hasEntitlement(entitlements, "key")`.
 * Add your own product features here.
 */
export const ENTITLEMENTS = [
  "projects",
  "advanced_analytics",
  "priority_support",
  "api_access",
] as const;
export type Entitlement = (typeof ENTITLEMENTS)[number];

export type BillingInterval = "month" | "year" | "one_time";

export interface PlanPrice {
  interval: BillingInterval;
  /** Stripe Price ID (price_...). Price IDs are not secret. */
  priceId: string | undefined;
  /** Display amount in major units (e.g. 19 = $19). */
  amount: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  /** Bullet points shown on the pricing table. */
  features: string[];
  /** Feature keys this plan unlocks in code. */
  entitlements: readonly Entitlement[];
  /** Usage limits. `null` = unlimited. */
  limits: { members: number | null };
  prices: PlanPrice[];
  /** Visually emphasise this plan on the pricing table. */
  highlighted?: boolean;
  badge?: string;
}

export const billingConfig = {
  currency: "usd",
  /** Which interval the pricing toggle starts on. */
  defaultInterval: "year" as Exclude<BillingInterval, "one_time">,
  /** Shown next to the yearly toggle. Set to "" to hide. */
  yearlyDiscountLabel: "Save 20%",
  /** Free trial length for subscriptions. 0 = no trial. */
  trialDays: 0,
  /** Let customers enter Stripe promotion codes at checkout. */
  allowPromotionCodes: true,
  /** Subscription statuses that keep a team on its paid plan. */
  activeStatuses: ["active", "trialing", "past_due"] as readonly string[],

  /** The plan every team is on until it pays. Must exist in `plans`. */
  freePlanId: "free",

  plans: [
    {
      id: "free",
      name: "Free",
      description: "Everything you need to try it out.",
      features: ["1 team member", "3 projects", "Community support"],
      entitlements: ["projects"],
      limits: { members: 1 },
      prices: [],
    },
    {
      id: "pro",
      name: "Pro",
      description: "For growing teams shipping every week.",
      features: [
        "Up to 10 team members",
        "Unlimited projects",
        "Advanced analytics",
        "Priority email support",
      ],
      entitlements: ["projects", "advanced_analytics", "priority_support"],
      limits: { members: 10 },
      highlighted: true,
      badge: "Most popular",
      prices: [
        {
          interval: "month",
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
          amount: 19,
        },
        {
          interval: "year",
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
          amount: 190,
        },
      ],
    },
    {
      id: "lifetime",
      name: "Lifetime",
      description: "Pay once, keep Pro features forever.",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "API access",
        "All future updates",
      ],
      entitlements: ["projects", "advanced_analytics", "priority_support", "api_access"],
      limits: { members: null },
      prices: [
        {
          interval: "one_time",
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME,
          amount: 299,
        },
      ],
    },
  ] satisfies Plan[] as Plan[],
};

export function getPlan(planId: string): Plan {
  const plan = billingConfig.plans.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan "${planId}". Check src/config/billing.ts.`);
  return plan;
}

export function getFreePlan(): Plan {
  return getPlan(billingConfig.freePlanId);
}

/** Find which plan a Stripe price belongs to. Returns undefined for unknown prices. */
export function findPlanByPriceId(priceId: string): { plan: Plan; price: PlanPrice } | undefined {
  for (const plan of billingConfig.plans) {
    const price = plan.prices.find((p) => p.priceId && p.priceId === priceId);
    if (price) return { plan, price };
  }
  return undefined;
}

export function formatPrice(amount: number, currency = billingConfig.currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
