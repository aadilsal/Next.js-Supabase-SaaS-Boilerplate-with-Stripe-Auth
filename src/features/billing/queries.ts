import "server-only";

import { cache } from "react";
import { logger } from "@/lib/logger";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { PriceCatalog } from "./lib/catalog";
import { resolveEntitlements, type TeamEntitlements } from "./lib/entitlements";

/**
 * Live Stripe prices keyed by price ID, from the `prices` table.
 * Returns {} if the catalog is empty or unreachable; the pricing table then
 * falls back to the amounts in src/config/billing.ts.
 */
export async function getPriceCatalog(): Promise<PriceCatalog> {
  try {
    const { data, error } = await createPublicClient()
      .from("prices")
      .select("id, active, unit_amount, currency");
    if (error) throw error;
    return Object.fromEntries(
      (data ?? []).map((price) => [
        price.id,
        { active: price.active, unitAmount: price.unit_amount, currency: price.currency },
      ]),
    );
  } catch (error) {
    logger.warn("billing.catalog_unavailable", { error });
    return {};
  }
}

const SUBSCRIPTION_COLUMNS =
  "id, team_id, status, price_id, interval, current_period_end, cancel_at_period_end";

/** The team's current plan, entitlements and limits (cached per request). */
export const getTeamEntitlements = cache(async (teamId: string): Promise<TeamEntitlements> => {
  const supabase = await createClient();
  const [subscriptions, purchases] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(SUBSCRIPTION_COLUMNS)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false }),
    supabase.from("purchases").select("price_id, status").eq("team_id", teamId),
  ]);

  return resolveEntitlements({
    subscriptions: subscriptions.data ?? [],
    purchases: purchases.data ?? [],
  });
});

/** Plan name per team, for the sidebar. Two queries regardless of team count. */
export async function getPlanNamesForTeams(teamIds: string[]): Promise<Record<string, string>> {
  if (teamIds.length === 0) return {};
  const supabase = await createClient();
  const [subscriptions, purchases] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(SUBSCRIPTION_COLUMNS)
      .in("team_id", teamIds)
      .order("created_at", { ascending: false }),
    supabase.from("purchases").select("team_id, price_id, status").in("team_id", teamIds),
  ]);

  return Object.fromEntries(
    teamIds.map((teamId) => [
      teamId,
      resolveEntitlements({
        subscriptions: (subscriptions.data ?? []).filter((s) => s.team_id === teamId),
        purchases: (purchases.data ?? []).filter((p) => p.team_id === teamId),
      }).plan.name,
    ]),
  );
}
