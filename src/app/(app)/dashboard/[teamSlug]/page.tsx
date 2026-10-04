import { ArrowRight, Boxes, CreditCard, Palette, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "@/config/features";
import { teamPath } from "@/config/navigation";
import { getTeamEntitlements } from "@/features/billing/queries";
import { ROLE_LABELS } from "@/features/teams/lib/permissions";
import { requireTeam } from "@/features/teams/queries";
import { isBillingEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Team home. This is where YOUR product goes: replace the placeholder
 * content below with your own features.
 */
export default async function TeamDashboardPage({ params }: PageProps<"/dashboard/[teamSlug]">) {
  const { teamSlug } = await params;
  const team = await requireTeam(teamSlug);
  const { plan } = await getTeamEntitlements(team.id);

  const nextSteps = [
    features.teams.enabled &&
      !team.is_personal && {
        icon: Users,
        title: "Invite your team",
        description: "Collaborate with teammates and assign roles.",
        href: teamPath(team.slug, "/settings/members"),
      },
    isBillingEnabled() && {
      icon: CreditCard,
      title: "Choose a plan",
      description: `You're on ${plan.name}. Upgrade for more.`,
      href: teamPath(team.slug, "/settings/billing"),
    },
    {
      icon: Palette,
      title: "Make it yours",
      description: "Rebrand in src/config/site.ts and src/app/globals.css.",
      href: teamPath(team.slug, "/settings"),
    },
  ].filter((step) => step !== false);

  return (
    <>
      <PageHeader
        title={team.name}
        description={`${plan.name} plan · Your role: ${ROLE_LABELS[team.role]}`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {nextSteps.map((step) => (
          <Link key={step.title} href={step.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <step.icon className="mb-2 size-5 text-primary" aria-hidden />
                <CardTitle className="flex items-center gap-1 text-base">
                  {step.title}
                  <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <EmptyState
        icon={Boxes}
        title="Your product goes here"
        description="Replace src/app/(app)/dashboard/[teamSlug]/page.tsx with your own features. Everything around it is done."
      />
    </>
  );
}
