"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { features } from "@/config/features";
import { teamPath } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { getTeamEntitlements } from "@/features/billing/queries";
import { sendTeamInviteEmail } from "@/features/email/send";
import { ActionError, authAction, teamAction, toActionError } from "@/lib/safe-action";
import { canChangeRole, canRemoveMember } from "./lib/permissions";
import { generateInvitationToken } from "./lib/tokens";
import {
  acceptInvitationSchema,
  createTeamSchema,
  deleteTeamSchema,
  inviteMemberSchema,
  leaveTeamSchema,
  removeMemberSchema,
  revokeInvitationSchema,
  updateMemberRoleSchema,
  updateTeamSchema,
} from "./schemas";

const SLUG_TAKEN = "That URL is already taken. Try another one.";

export const createTeam = authAction(createTeamSchema, async ({ input, supabase }) => {
  if (!features.teams.enabled || !features.teams.allowCreate) {
    throw new ActionError("Creating teams is disabled.");
  }
  const { data, error } = await supabase.rpc("create_team", { p_name: input.name });
  if (error) throw toActionError(error, { uniqueViolation: SLUG_TAKEN });

  revalidatePath("/dashboard", "layout");
  return { slug: data.slug };
});

export const updateTeam = teamAction(
  updateTeamSchema,
  { roles: ["owner", "admin"] },
  async ({ input, team, supabase }) => {
    const { error } = await supabase
      .from("teams")
      .update({ name: input.name, slug: input.slug })
      .eq("id", team.id);
    if (error) throw toActionError(error, { uniqueViolation: SLUG_TAKEN });

    revalidatePath("/dashboard", "layout");
    return { slug: input.slug };
  },
);

export const deleteTeam = teamAction(
  deleteTeamSchema,
  { roles: ["owner"] },
  async ({ team, supabase }) => {
    if (team.is_personal) throw new ActionError("Your personal workspace can't be deleted.");

    const { data: activeSubscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("team_id", team.id)
      .in("status", ["active", "trialing", "past_due"])
      .limit(1)
      .maybeSingle();
    if (activeSubscription) {
      throw new ActionError("Cancel this team's subscription from the billing page first.");
    }

    const { error } = await supabase.from("teams").delete().eq("id", team.id);
    if (error) throw toActionError(error);

    revalidatePath("/dashboard", "layout");
    redirect("/dashboard");
  },
);

export const inviteMember = teamAction(
  inviteMemberSchema,
  { roles: ["owner", "admin"] },
  async ({ input, team, user, supabase }) => {
    if (!features.teams.enabled) throw new ActionError("Team invitations are disabled.");
    if (team.is_personal) {
      throw new ActionError("Your personal workspace is just for you. Create a team to invite people.");
    }

    const email = input.email.toLowerCase();

    // Already a member?
    const { data: members } = await supabase
      .from("team_members")
      .select("user_id, profile:profiles(email)")
      .eq("team_id", team.id);
    if (members?.some((m) => m.profile?.email.toLowerCase() === email)) {
      throw new ActionError("That person is already a member of this team.");
    }

    // Plan seat limit (members + open invitations).
    const { limits } = await getTeamEntitlements(team.id);
    if (limits.members !== null) {
      const { count: pendingCount } = await supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id)
        .is("accepted_at", null)
        .neq("email", email);
      const seatsUsed = (members?.length ?? 0) + (pendingCount ?? 0);
      if (seatsUsed >= limits.members) {
        throw new ActionError(
          `Your plan includes ${limits.members} member${limits.members === 1 ? "" : "s"}. Upgrade to invite more.`,
        );
      }
    }

    // Re-inviting replaces any previous open invitation for the same email.
    await supabase
      .from("invitations")
      .delete()
      .eq("team_id", team.id)
      .eq("email", email)
      .is("accepted_at", null);

    const { token, tokenHash } = generateInvitationToken();
    const { error } = await supabase.from("invitations").insert({
      team_id: team.id,
      email,
      role: input.role,
      token_hash: tokenHash,
      invited_by: user.id,
    });
    if (error) throw toActionError(error);

    const inviteUrl = `${siteConfig.url}/invite/${token}`;
    let emailSent = true;
    try {
      await sendTeamInviteEmail({
        to: email,
        teamName: team.name,
        inviterName: user.user_metadata.full_name ?? user.email ?? "A teammate",
        inviteUrl,
      });
    } catch (emailError) {
      console.error("[teams] Invitation email failed:", emailError);
      emailSent = false;
    }

    revalidatePath(teamPath(team.slug, "/settings/members"));
    // The link is returned so owners/admins can share it manually if email isn't set up.
    return { inviteUrl, emailSent };
  },
);

export const revokeInvitation = teamAction(
  revokeInvitationSchema,
  { roles: ["owner", "admin"] },
  async ({ input, team, supabase }) => {
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", input.invitationId)
      .eq("team_id", team.id);
    if (error) throw toActionError(error);
    revalidatePath(teamPath(team.slug, "/settings/members"));
  },
);

export const updateMemberRole = teamAction(
  updateMemberRoleSchema,
  { roles: ["owner", "admin"] },
  async ({ input, team, role, supabase }) => {
    const { data: target } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", team.id)
      .eq("user_id", input.userId)
      .maybeSingle();
    if (!target) throw new ActionError("Member not found.");
    if (!canChangeRole(role, target.role, input.role)) {
      throw new ActionError("You don't have permission to make that change.");
    }

    const { error } = await supabase
      .from("team_members")
      .update({ role: input.role })
      .eq("team_id", team.id)
      .eq("user_id", input.userId);
    if (error) throw toActionError(error);
    revalidatePath(teamPath(team.slug, "/settings/members"));
  },
);

export const removeMember = teamAction(
  removeMemberSchema,
  { roles: ["owner", "admin"] },
  async ({ input, team, role, user, supabase }) => {
    if (input.userId === user.id) throw new ActionError("Use “Leave team” to remove yourself.");

    const { data: target } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", team.id)
      .eq("user_id", input.userId)
      .maybeSingle();
    if (!target) throw new ActionError("Member not found.");
    if (!canRemoveMember(role, target.role)) {
      throw new ActionError("You don't have permission to remove this member.");
    }

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", team.id)
      .eq("user_id", input.userId);
    if (error) throw toActionError(error);
    revalidatePath(teamPath(team.slug, "/settings/members"));
  },
);

export const leaveTeam = teamAction(leaveTeamSchema, {}, async ({ team, user, supabase }) => {
  if (team.is_personal) throw new ActionError("You can't leave your personal workspace.");

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", team.id)
    .eq("user_id", user.id);
  if (error) throw toActionError(error);

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
});

export const acceptInvitation = authAction(acceptInvitationSchema, async ({ input, supabase }) => {
  const { data: teamSlug, error } = await supabase.rpc("accept_invitation", {
    p_token: input.token,
  });
  if (error) throw toActionError(error);

  revalidatePath("/dashboard", "layout");
  redirect(teamPath(teamSlug));
});
