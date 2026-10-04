import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { features } from "@/config/features";
import { CheckoutStatus } from "@/features/billing/components/checkout-status";
import { CurrentPlanCard } from "@/features/billing/components/current-plan-card";
import { PricingTable } from "@/features/billing/components/pricing-table";
import { getTeamEntitlements } from "@/features/billing/queries";
import { canManageBilling } from "@/features/teams/lib/permissions";
import { requireTeam } from "@/features/teams/queries";
import { isBillingEnabled } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage({
  params,
  searchParams,
}: PageProps<"/dashboard/[teamSlug]/settings/billing">) {
  if (!features.billing) notFound();
  const { teamSlug } = await params;
  const { checkout } = await searchParams;
  const team = await requireTeam(teamSlug);

  if (!isBillingEnabled()) {
    return (
      <>
        <PageHeader title="Billing" />
        <Alert>
          <AlertTitle>Billing isn&apos;t set up yet</AlertTitle>
          <AlertDescription>
            Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env.local and restart the server. See the
            Getting Started guide in docs/.
          </AlertDescription>
        </Alert>
      </>
    );
  }

  const supabase = await createClient();
  const [entitlements, { data: customer }] = await Promise.all([
    getTeamEntitlements(team.id),
    supabase.from("billing_customers").select("team_id").eq("team_id", team.id).maybeSingle(),
  ]);
  const canManage = canManageBilling(team.role);

  return (
    <>
      <PageHeader title="Billing" description="Manage your plan and payment details." />
      <CheckoutStatus
        checkout={typeof checkout === "string" ? checkout : undefined}
        isUpgraded={entitlements.source !== "free"}
      />
      <CurrentPlanCard
        teamSlug={team.slug}
        canManage={canManage}
        hasCustomer={Boolean(customer)}
        summary={{
          planName: entitlements.plan.name,
          source: entitlements.source,
          status: entitlements.subscription?.status ?? null,
          currentPeriodEnd: entitlements.subscription?.current_period_end ?? null,
          cancelAtPeriodEnd: entitlements.subscription?.cancel_at_period_end ?? false,
        }}
      />
      {entitlements.source !== "lifetime" && (
        <PricingTable
          mode={{
            kind: "app",
            teamSlug: team.slug,
            currentPlanId: entitlements.plan.id,
            canPurchase: canManage,
            hasSubscription: entitlements.source === "subscription",
          }}
        />
      )}
    </>
  );
}
