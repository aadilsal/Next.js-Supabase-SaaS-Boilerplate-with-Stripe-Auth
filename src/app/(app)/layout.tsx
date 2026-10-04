import { AppShell } from "@/components/shared/app-shell";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { getFreePlan } from "@/config/billing";
import { getPlanNamesForTeams } from "@/features/billing/queries";
import { getUserTeams } from "@/features/teams/queries";
import { getProfile, requireUser } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/stripe";

/** Shell for everything behind sign-in: /dashboard/* and /account/*. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const [profile, teams] = await Promise.all([getProfile(), getUserTeams()]);

  if (teams.length === 0) {
    // Every user gets a personal team from the handle_new_user() trigger.
    throw new Error("This account has no workspace. Did the database migrations run?");
  }

  const billingEnabled = isBillingEnabled();
  const planNames = billingEnabled ? await getPlanNamesForTeams(teams.map((team) => team.id)) : {};

  return (
    <AppShell
      user={{
        name: profile?.full_name ?? null,
        email: user.email ?? profile?.email ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        isPlatformAdmin: profile?.is_platform_admin ?? false,
      }}
      sidebar={
        <AppSidebar
          billingEnabled={billingEnabled}
          teams={teams.map((team) => ({
            id: team.id,
            name: team.name,
            slug: team.slug,
            isPersonal: team.is_personal,
            role: team.role,
            planName: planNames[team.id] ?? getFreePlan().name,
          }))}
        />
      }
    >
      {children}
    </AppShell>
  );
}
