"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/auth";
import { ActionError, authAction, toActionError } from "@/lib/safe-action";
import { createAdminClient } from "@/lib/supabase/admin";

const setUserBannedSchema = z.object({ userId: z.guid(), banned: z.boolean() });

/** Ban or unban a user. Banned users can't sign in or refresh their session. */
export const setUserBanned = authAction(setUserBannedSchema, async ({ input, user }) => {
  await requirePlatformAdmin();
  if (input.userId === user.id) throw new ActionError("You can't ban yourself.");

  // Service role: only the Auth admin API can ban users.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(input.userId, {
    ban_duration: input.banned ? "876000h" : "none",
  });
  if (error) throw toActionError(error);
  revalidatePath("/admin/users");
});
