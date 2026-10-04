import { Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { features } from "@/config/features";
import { getTeamEntitlements } from "@/features/billing/queries";
import { InviteMemberDialog } from "@/features/teams/components/invite-member-dialog";
import { MembersTable } from "@/features/teams/components/members-table";
import { PendingInvitations } from "@/features/teams/components/pending-invitations";
import { canManageMembers } from "@/features/teams/lib/permissions";
import { getPendingInvitations, getTeamMembers, requireTeam } from "@/features/teams/queries";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage({ params }: PageProps<"/dashboard/[teamSlug]/settings/members">) {
  if (!features.teams.enabled) notFound();
  const { teamSlug } = await params;
  const team = await requireTeam(teamSlug);

  if (team.is_personal) {
    return (
      <>
        <PageHeader title="Members" />
        <EmptyState
          icon={Users}
          title="This is your personal workspace"
          description="Create a team from the team switcher in the sidebar to invite people and collaborate."
        />
      </>
    );
  }

  const canManage = canManageMembers(team.role);
  const [user, members, invitations, { limits }] = await Promise.all([
    getUser(),
    getTeamMembers(team.id),
    canManage ? getPendingInvitations(team.id) : Promise.resolve([]),
    getTeamEntitlements(team.id),
  ]);

  const seats =
    limits.members === null
      ? `${members.length} members`
      : `${members.length + invitations.length} of ${limits.members} seats used`;

  return (
    <>
      <PageHeader
        title="Members"
        description={seats}
        actions={canManage && <InviteMemberDialog teamSlug={team.slug} />}
      />
      <MembersTable
        teamSlug={team.slug}
        members={members}
        currentUserId={user?.id ?? ""}
        currentRole={team.role}
      />
      {canManage && invitations.length > 0 && (
        <PendingInvitations teamSlug={team.slug} invitations={invitations} />
      )}
    </>
  );
}
