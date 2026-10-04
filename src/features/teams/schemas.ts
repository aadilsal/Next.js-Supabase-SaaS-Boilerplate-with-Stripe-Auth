import { z } from "zod";

export const teamNameSchema = z
  .string()
  .trim()
  .min(1, "Team name is required.")
  .max(64, "Keep it under 64 characters.");

export const teamSlugSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?$/,
    "Use 1–48 lowercase letters, numbers or dashes (no dash at the start or end).",
  );

const teamSlug = z.string().min(1);
const assignableRole = z.enum(["admin", "member"]);

export const createTeamSchema = z.object({ name: teamNameSchema });

export const updateTeamSchema = z.object({
  teamSlug,
  name: teamNameSchema,
  slug: teamSlugSchema,
});

export const deleteTeamSchema = z.object({ teamSlug });

export const inviteMemberSchema = z.object({
  teamSlug,
  email: z.email("Enter a valid email address.").trim(),
  role: assignableRole,
});

export const revokeInvitationSchema = z.object({ teamSlug, invitationId: z.guid() });

export const updateMemberRoleSchema = z.object({
  teamSlug,
  userId: z.guid(),
  role: z.enum(["owner", "admin", "member"]),
});

export const removeMemberSchema = z.object({ teamSlug, userId: z.guid() });

export const leaveTeamSchema = z.object({ teamSlug });

export const acceptInvitationSchema = z.object({ token: z.string().min(16) });

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
