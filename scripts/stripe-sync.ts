/**
 * Copy every Stripe Product and Price into the `products` / `prices` tables.
 *
 *   pnpm stripe:sync
 *
 * Webhooks keep the catalog up to date after this, but they only fire on
 * changes, so run this once after setting up Stripe (and after switching
 * between test and live mode).
 *
 * Uses STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * from .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { toPriceRow, toProductRow } from "../src/features/billing/lib/catalog";
import type { Database } from "../src/types/database";

async function main() {
  const { STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!STRIPE_SECRET_KEY || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Set STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
    process.exit(1);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const supabase = createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Products first: prices reference them.
  let products = 0;
  for await (const product of stripe.products.list({ limit: 100 })) {
    const { error } = await supabase.from("products").upsert(toProductRow(product));
    if (error) throw error;
    products++;
  }

  let prices = 0;
  for await (const price of stripe.prices.list({ limit: 100 })) {
    const { error } = await supabase.from("prices").upsert(toPriceRow(price));
    if (error) throw error;
    prices++;
  }

  console.log(`✓ Synced ${products} products and ${prices} prices from Stripe.`);
}

main().catch((error) => {
  console.error("Sync failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
