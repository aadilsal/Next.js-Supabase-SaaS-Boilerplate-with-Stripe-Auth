import { Lock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Entitlement } from "@/config/billing";
import { teamPath } from "@/config/navigation";
import { hasEntitlement } from "../lib/entitlements";
import { getTeamEntitlements } from "../queries";

/**
 * Server Component that renders `children` only when the team's plan includes
 * `entitlement`, otherwise an upgrade prompt.
 *
 *   <UpgradeGate team={team} entitlement="advanced_analytics">
 *     <AnalyticsChart />
 *   </UpgradeGate>
 *
 * This hides UI only. Also check hasEntitlement() in the Server Actions behind it.
 */
export async function UpgradeGate({
  team,
  entitlement,
  children,
}: {
  team: { id: string; slug: string };
  entitlement: Entitlement;
  children: ReactNode;
}) {
  const entitlements = await getTeamEntitlements(team.id);
  if (hasEntitlement(entitlements, entitlement)) return children;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <Lock className="size-5 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">This feature isn&apos;t included in your current plan.</p>
      <Button size="sm" asChild>
        <Link href={teamPath(team.slug, "/settings/billing")}>See plans</Link>
      </Button>
    </div>
  );
}
