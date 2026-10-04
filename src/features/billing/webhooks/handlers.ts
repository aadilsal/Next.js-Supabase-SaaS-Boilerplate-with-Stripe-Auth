import "server-only";

import type Stripe from "stripe";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;
interface Deps {
  stripe: Stripe;
  admin: AdminClient;
}

/**
 * Stripe events we act on. Subscribe your webhook endpoint to exactly these.
 * Every handler RE-FETCHES the object from Stripe, because events can arrive
 * out of order and may be stale.
 */
export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.payment_failed",
  "invoice.paid",
  "charge.refunded",
] as const;

export async function handleStripeEvent(event: Stripe.Event, deps: Deps): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await syncCheckoutSession(event.data.object.id, deps);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await syncSubscription(event.data.object.id, deps);
      break;

    case "invoice.paid":
    case "invoice.payment_failed": {
      const subscription = event.data.object.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscription === "string" ? subscription : subscription?.id;
      if (subscriptionId) await syncSubscription(subscriptionId, deps);
      break;
    }

    case "charge.refunded":
      await markPurchaseRefunded(event.data.object, deps);
      break;

    default:
      // Not an event we care about. Return 200 so Stripe doesn't retry it.
      break;
  }
}

async function syncCheckoutSession(sessionId: string, { stripe, admin }: Deps) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const teamId = session.client_reference_id ?? session.metadata?.team_id;
  if (!teamId) {
    console.warn(`[stripe] Checkout session ${session.id} has no team id; ignoring.`);
    return;
  }

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (customerId) {
    const { error } = await admin
      .from("billing_customers")
      .upsert({ team_id: teamId, stripe_customer_id: customerId }, { onConflict: "team_id" });
    if (error) throw error;
  }

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    await syncSubscription(subscriptionId, { stripe, admin }, teamId);
    return;
  }

  if (session.mode === "payment") {
    // Delayed payment methods (e.g. bank debits) finish later via
    // checkout.session.async_payment_succeeded.
    if (session.payment_status !== "paid") return;

    let priceId = session.metadata?.price_id;
    if (!priceId) {
      const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      priceId = items.data[0]?.price?.id;
    }
    if (!priceId) throw new Error(`Checkout session ${session.id} has no price.`);

    const { error } = await admin.from("purchases").upsert({
      id: session.id,
      team_id: teamId,
      price_id: priceId,
      amount_total: session.amount_total,
      currency: session.currency,
      status: "paid",
    });
    if (error) throw error;
  }
}

async function syncSubscription(subscriptionId: string, { stripe, admin }: Deps, knownTeamId?: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const teamId =
    knownTeamId ?? subscription.metadata.team_id ?? (await findTeamByCustomer(subscription, admin));
  if (!teamId) {
    console.warn(`[stripe] Subscription ${subscription.id} has no team; ignoring.`);
    return;
  }

  const item = subscription.items.data[0];
  if (!item) throw new Error(`Subscription ${subscription.id} has no items.`);

  const { error } = await admin.from("subscriptions").upsert({
    id: subscription.id,
    team_id: teamId,
    status: subscription.status,
    price_id: item.price.id,
    interval: item.price.recurring?.interval ?? null,
    current_period_end: item.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
  if (error) throw error;
}

async function findTeamByCustomer(subscription: Stripe.Subscription, admin: AdminClient) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const { data } = await admin
    .from("billing_customers")
    .select("team_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.team_id;
}

/** A fully refunded one-time payment removes lifetime access. */
async function markPurchaseRefunded(charge: Stripe.Charge, { stripe, admin }: Deps) {
  if (!charge.refunded) return; // partial refund: keep access
  const paymentIntent =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntent) return;

  const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent, limit: 1 });
  const session = sessions.data[0];
  if (!session) return;

  const { error } = await admin.from("purchases").update({ status: "refunded" }).eq("id", session.id);
  if (error) throw error;
}
