"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  billingConfig,
  formatPrice,
  type BillingInterval,
  type Plan,
  type PlanPrice,
} from "@/config/billing";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { createCheckoutSession } from "../actions";
import { resolveDisplayPrice, type PriceCatalog } from "../lib/catalog";

type RecurringInterval = Exclude<BillingInterval, "one_time">;

/** Where the table is shown: the public pricing page, or a team's billing page. */
export type PricingTableMode =
  | { kind: "marketing" }
  | {
      kind: "app";
      teamSlug: string;
      currentPlanId: string;
      /** Only owners can buy. */
      canPurchase: boolean;
      /** Subscribed teams change plans in the Stripe portal instead. */
      hasSubscription: boolean;
    };

function priceFor(plan: Plan, interval: RecurringInterval): PlanPrice | undefined {
  return (
    plan.prices.find((price) => price.interval === interval) ??
    plan.prices.find((price) => price.interval === "one_time")
  );
}

const INTERVAL_SUFFIX: Record<BillingInterval, string> = {
  month: "/month",
  year: "/year",
  one_time: " one-time",
};

/**
 * `catalog` holds live Stripe prices (from the `prices` table). When a price is
 * missing from it, the `amount` in src/config/billing.ts is shown instead.
 */
export function PricingTable({ mode, catalog }: { mode: PricingTableMode; catalog?: PriceCatalog }) {
  const [interval, setInterval] = useState<RecurringInterval>(billingConfig.defaultInterval);
  const hasRecurring = billingConfig.plans.some((plan) =>
    plan.prices.some((price) => price.interval !== "one_time"),
  );

  return (
    <div className="space-y-8">
      {hasRecurring && (
        <div className="flex justify-center">
          <Tabs value={interval} onValueChange={(value) => setInterval(value as RecurringInterval)}>
            <TabsList>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="year">
                Yearly
                {billingConfig.yearlyDiscountLabel && (
                  <Badge variant="secondary" className="ml-1">
                    {billingConfig.yearlyDiscountLabel}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {billingConfig.plans.map((plan) => {
          const price = priceFor(plan, interval);
          const display = price ? resolveDisplayPrice(price, catalog, billingConfig.currency) : undefined;
          return (
            <Card
              key={plan.id}
              className={cn("flex flex-col", plan.highlighted && "border-primary ring-1 ring-primary")}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.badge && <Badge>{plan.badge}</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-semibold tracking-tight">
                    {formatPrice(display?.amount ?? 0, display?.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {price ? INTERVAL_SUFFIX[price.interval] : " forever"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <PlanButton plan={plan} price={price} available={display?.available ?? true} mode={mode} />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PlanButton({
  plan,
  price,
  available,
  mode,
}: {
  plan: Plan;
  price?: PlanPrice;
  /** False when the price is archived in Stripe. */
  available: boolean;
  mode: PricingTableMode;
}) {
  const variant = plan.highlighted ? "default" : "outline";

  if (mode.kind === "marketing") {
    return (
      <Button className="w-full" variant={variant} asChild>
        <Link href="/sign-up">{price ? `Get ${plan.name}` : "Get started"}</Link>
      </Button>
    );
  }

  const disabled = (label: string) => (
    <Button className="w-full" variant="outline" disabled>
      {label}
    </Button>
  );

  if (mode.currentPlanId === plan.id) return disabled("Current plan");
  if (!price) return null;
  if (!price.priceId) return disabled("Price not configured");
  if (!available) return disabled("No longer available");
  if (!mode.canPurchase) return disabled("Only owners can upgrade");
  if (mode.hasSubscription && price.interval !== "one_time") return disabled("Use “Manage billing”");

  return <CheckoutButton teamSlug={mode.teamSlug} priceId={price.priceId} label={`Upgrade to ${plan.name}`} variant={variant} />;
}

function CheckoutButton({
  teamSlug,
  priceId,
  label,
  variant,
}: {
  teamSlug: string;
  priceId: string;
  label: string;
  variant: "default" | "outline";
}) {
  const { execute, isPending } = useAction(createCheckoutSession, {
    onSuccess: ({ url }) => window.location.assign(url),
  });
  return (
    <SubmitButton
      type="button"
      className="w-full"
      variant={variant}
      pending={isPending}
      onClick={() => execute({ teamSlug, priceId })}
    >
      {label}
    </SubmitButton>
  );
}
