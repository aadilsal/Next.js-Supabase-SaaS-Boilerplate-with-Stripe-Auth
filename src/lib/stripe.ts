import "server-only";

import Stripe from "stripe";
import { siteConfig } from "@/config/site";
import { features } from "@/config/features";
import { serverEnv } from "@/env";

let stripe: Stripe | undefined;

/** True when billing is switched on AND Stripe keys are present. */
export function isBillingEnabled(): boolean {
  return features.billing && Boolean(serverEnv().STRIPE_SECRET_KEY);
}

/** Lazily created Stripe SDK client. The API version is pinned by the SDK. */
export function getStripe(): Stripe {
  const key = serverEnv().STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local.");
  }
  stripe ??= new Stripe(key, {
    appInfo: { name: siteConfig.name, url: siteConfig.url },
  });
  return stripe;
}
