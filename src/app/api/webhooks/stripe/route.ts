import { handleStripeEvent } from "@/features/billing/webhooks/handlers";
import { serverEnv } from "@/env";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe webhook endpoint: POST /api/webhooks/stripe
 *
 * 1. Verify the signature against the RAW body (never parse JSON first).
 * 2. Record the event id first, so retries and duplicates are processed once.
 * 3. Sync our copy of the billing data from Stripe.
 *
 * Local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = serverEnv();
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe] STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET are not set.");
    return new Response("Billing is not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const stripe = getStripe();
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.warn("[stripe] Invalid webhook signature:", (error as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  // Service role: webhooks have no signed-in user, and billing tables are server-write only.
  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (insertError) {
    if (insertError.code === "23505") {
      return Response.json({ received: true, duplicate: true });
    }
    console.error("[stripe] Could not record event:", insertError);
    return new Response("Database error", { status: 500 });
  }

  try {
    await handleStripeEvent(event, { stripe, admin });
  } catch (error) {
    console.error(`[stripe] Failed to handle ${event.type} (${event.id}):`, error);
    // Forget the event so Stripe's automatic retry gets processed.
    await admin.from("stripe_events").delete().eq("id", event.id);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return Response.json({ received: true });
}
