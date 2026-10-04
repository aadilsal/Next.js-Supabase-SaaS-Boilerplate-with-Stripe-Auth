"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { recordAuditEvent } from "@/features/audit/record";
import { ActionError, authAction, toActionError } from "@/lib/safe-action";
import { getStripe, isBillingEnabled } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from "./schemas";

export const updateProfile = authAction(updateProfileSchema, async ({ input, user, supabase }) => {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName })
    .eq("id", user.id);
  if (error) throw toActionError(error);

  // Keep auth metadata in sync (used as the sender name on invitations).
  await supabase.auth.updateUser({ data: { full_name: input.fullName } });
  await recordAuditEvent({ action: "account.profile_updated", actor: user });
  revalidatePath("/", "layout");
});

export const changePassword = authAction(changePasswordSchema, async ({ input, user, supabase }) => {
  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) {
    if (error.code === "same_password") throw new ActionError("Choose a different password.");
    throw new ActionError(error.message);
  }
  await recordAuditEvent({ action: "auth.password_changed", actor: user, metadata: { via: "account_settings" } });
});

export const signOutEverywhere = authAction(z.object({}), async ({ user, supabase }) => {
  await recordAuditEvent({ action: "auth.signed_out_everywhere", actor: user });
  await supabase.auth.signOut({ scope: "global" });
  redirect("/sign-in");
});

/**
 * Deletes the user's account and every team where they are the only member.
 * Blocks if they own a shared team with no other owner (transfer it first).
 */
export const deleteAccount = authAction(deleteAccountSchema, async ({ user, supabase }) => {
  const { data: memberships, error } = await supabase
    .from("team_members")
    .select("role, team:teams(id, name, is_personal)")
    .eq("user_id", user.id);
  if (error) throw toActionError(error);

  const teamsToDelete: string[] = [];
  for (const membership of memberships ?? []) {
    const team = membership.team;
    if (!team) continue;
    if (team.is_personal) {
      teamsToDelete.push(team.id);
      continue;
    }
    if (membership.role !== "owner") continue;

    const { data: others } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", team.id)
      .neq("user_id", user.id);
    if (!others || others.length === 0) {
      teamsToDelete.push(team.id);
    } else if (!others.some((m) => m.role === "owner")) {
      throw new ActionError(`Make someone else an owner of “${team.name}” before deleting your account.`);
    }
  }

  // Service role: deleting auth users and cleaning up billing needs admin rights.
  const admin = createAdminClient();

  if (teamsToDelete.length > 0 && isBillingEnabled()) {
    const { data: subscriptions } = await admin
      .from("subscriptions")
      .select("id")
      .in("team_id", teamsToDelete)
      .in("status", ["active", "trialing", "past_due"]);
    for (const subscription of subscriptions ?? []) {
      await getStripe().subscriptions.cancel(subscription.id);
    }
  }

  if (teamsToDelete.length > 0) {
    const { error: deleteTeamsError } = await admin.from("teams").delete().in("id", teamsToDelete);
    if (deleteTeamsError) throw toActionError(deleteTeamsError);
  }

  // Recorded before deletion; the entry is kept (audit logs have no foreign keys).
  await recordAuditEvent({ action: "account.deleted", actor: user, metadata: { deletedTeams: teamsToDelete } });

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) throw toActionError(deleteUserError);

  await supabase.auth.signOut();
  redirect("/");
});
