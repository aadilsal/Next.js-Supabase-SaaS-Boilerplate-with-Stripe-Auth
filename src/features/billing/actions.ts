"use server";

import { billingConfig, findPlanByPriceId } from "@/config/billing";
import { teamPath } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { ActionError, teamAction } from "@/lib/safe-action";
import { getStripe, isBillingEnabled } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServerClient } from "@/lib/supabase/server";
import type { Team } from "@/types/database";
import { getTeamEntitlements } from "./queries";
import { checkoutSchema, portalSchema } from "./schemas";

function billingPageUrl(team: Team, query = ""): string {
  return `${siteConfig.url}${teamPath(team.slug, "/settings/billing")}${query}`;
}

/** The team's Stripe customer id, creating the customer on first checkout. */
async function getOrCreateCustomer(
  team: Team,
  email: string | undefined,
  supabase: ServerClient,
): Promise<string> {
  const { data: existing } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("team_id", team.id)
    .maybeSingle();
  if (existing) return existing.stripe_customer_id;

  // The idempotency key stops double-clicks from creating two customers.
  const customer = await getStripe().customers.create(
    { email, name: team.name, metadata: { team_id: team.id } },
    { idempotencyKey: `customer-for-team-${team.id}` },
  );

  // Service role: billing tables are written only by trusted server code (no user write policy).
  const admin = createAdminClient();
  const { error } = await admin
    .from("billing_customers")
    .upsert(
      { team_id: team.id, stripe_customer_id: customer.id },
      { onConflict: "team_id", ignoreDuplicates: true },
    );
  if (error) throw error;
  return customer.id;
}

/** Starts Stripe Checkout. Returns the hosted Checkout URL to redirect to. */
export const createCheckoutSession = teamAction(
  checkoutSchema,
  { roles: ["owner"] },
  async ({ input, team, user, supabase }) => {
    if (!isBillingEnabled()) throw new ActionError("Billing isn't set up yet.");

    const match = findPlanByPriceId(input.priceId);
    if (!match) throw new ActionError("That plan is no longer available.");

    const current = await getTeamEntitlements(team.id);
    if (current.source === "lifetime") {
      throw new ActionError("This team already has lifetime access.");
    }
    const isOneTime = match.price.interval === "one_time";
    if (!isOneTime && current.source === "subscription") {
      throw new ActionError("This team already has a subscription. Use “Manage billing” to change plans.");
    }

    const customer = await getOrCreateCustomer(team, user.email, supabase);
    const metadata = { team_id: team.id, price_id: input.priceId };

    const session = await getStripe().checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      customer,
      client_reference_id: team.id,
      line_items: [{ price: input.priceId, quantity: 1 }],
      allow_promotion_codes: billingConfig.allowPromotionCodes,
      metadata,
      ...(isOneTime
        ? { payment_intent_data: { metadata } }
        : {
            subscription_data: {
              metadata,
              ...(billingConfig.trialDays > 0 ? { trial_period_days: billingConfig.trialDays } : {}),
            },
          }),
      success_url: billingPageUrl(team, "?checkout=success"),
      cancel_url: billingPageUrl(team, "?checkout=canceled"),
    });

    if (!session.url) throw new ActionError("Couldn't start checkout. Please try again.");
    return { url: session.url };
  },
);

/** Opens the Stripe Customer Portal (change plan, update card, cancel, invoices). */
export const createPortalSession = teamAction(
  portalSchema,
  { roles: ["owner"] },
  async ({ team, supabase }) => {
    if (!isBillingEnabled()) throw new ActionError("Billing isn't set up yet.");

    const { data: customer } = await supabase
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("team_id", team.id)
      .maybeSingle();
    if (!customer) throw new ActionError("This team has no billing history yet.");

    const session = await getStripe().billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: billingPageUrl(team),
    });
    return { url: session.url };
  },
);
