import {
  billingConfig,
  findPlanByPriceId,
  getFreePlan,
  type Entitlement,
  type Plan,
} from "@/config/billing";

/** The billing rows we need to decide a team's plan. */
export interface BillingSnapshot {
  subscriptions: {
    id: string;
    status: string;
    price_id: string;
    interval: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  }[];
  purchases: { price_id: string; status: string }[];
}

export interface TeamEntitlements {
  plan: Plan;
  /** Where the plan comes from. */
  source: "free" | "subscription" | "lifetime";
  /** The subscription granting the plan, when source is "subscription". */
  subscription: BillingSnapshot["subscriptions"][number] | null;
  entitlements: readonly Entitlement[];
  limits: Plan["limits"];
}

/**
 * Decide which plan a team is on. Pure function (no I/O), so it's easy to test.
 *
 * Order: an active subscription, then a paid one-time purchase, then Free.
 * Prices that aren't in src/config/billing.ts are ignored.
 */
export function resolveEntitlements(snapshot: BillingSnapshot): TeamEntitlements {
  for (const subscription of snapshot.subscriptions) {
    if (!billingConfig.activeStatuses.includes(subscription.status)) continue;
    const match = findPlanByPriceId(subscription.price_id);
    if (match) return build(match.plan, "subscription", subscription);
  }

  for (const purchase of snapshot.purchases) {
    if (purchase.status !== "paid") continue;
    const match = findPlanByPriceId(purchase.price_id);
    if (match) return build(match.plan, "lifetime", null);
  }

  return build(getFreePlan(), "free", null);
}

function build(
  plan: Plan,
  source: TeamEntitlements["source"],
  subscription: TeamEntitlements["subscription"],
): TeamEntitlements {
  return { plan, source, subscription, entitlements: plan.entitlements, limits: plan.limits };
}

/**
 * Feature gate. Use it in Server Components and Server Actions:
 *   if (!hasEntitlement(await getTeamEntitlements(team.id), "api_access")) ...
 */
export function hasEntitlement(team: TeamEntitlements, entitlement: Entitlement): boolean {
  return team.entitlements.includes(entitlement);
}
