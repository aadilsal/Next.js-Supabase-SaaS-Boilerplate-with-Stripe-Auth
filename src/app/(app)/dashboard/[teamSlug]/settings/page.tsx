import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { DangerZone } from "@/features/teams/components/danger-zone";
import { TeamSettingsForm } from "@/features/teams/components/team-settings-form";
import { canDeleteTeam, canEditTeam } from "@/features/teams/lib/permissions";
import { requireTeam } from "@/features/teams/queries";

export const metadata: Metadata = { title: "Team settings" };

export default async function TeamSettingsPage({ params }: PageProps<"/dashboard/[teamSlug]/settings">) {
  const { teamSlug } = await params;
  const team = await requireTeam(teamSlug);

  return (
    <>
      <PageHeader title="General" description="Your team's name and URL." />
      <div className="max-w-2xl space-y-8">
        <TeamSettingsForm
          team={{ name: team.name, slug: team.slug }}
          canEdit={canEditTeam(team.role)}
        />
        {!team.is_personal && (
          <DangerZone
            team={{ name: team.name, slug: team.slug }}
            canDelete={canDeleteTeam(team.role, team.is_personal)}
          />
        )}
      </div>
    </>
  );
}
