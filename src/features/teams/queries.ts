import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Team, TeamRole } from "@/types/database";

export type TeamWithRole = Team & { role: TeamRole };

/** All teams the current user belongs to, oldest first (personal team first). */
export const getUserTeams = cache(async (): Promise<TeamWithRole[]> => {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("role, team:teams(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).flatMap((m) => (m.team ? [{ ...m.team, role: m.role }] : []));
});

/** One of the user's teams by slug, or null if they aren't a member. */
export const getTeamForUser = cache(async (slug: string): Promise<TeamWithRole | null> => {
  const teams = await getUserTeams();
  return teams.find((team) => team.slug === slug) ?? null;
});

/**
 * The team for a [teamSlug] route, or a 404. We return 404 (not 403) so
 * team slugs can't be discovered by guessing.
 */
export async function requireTeam(slug: string): Promise<TeamWithRole> {
  const team = await getTeamForUser(slug);
  if (!team) notFound();
  return team;
}

export interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("user_id, role, created_at, profile:profiles(email, full_name, avatar_url)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((m) => ({
    userId: m.user_id,
    role: m.role,
    joinedAt: m.created_at,
    email: m.profile?.email ?? "",
    fullName: m.profile?.full_name ?? null,
    avatarUrl: m.profile?.avatar_url ?? null,
  }));
}

/** Open invitations (RLS: only owners/admins can read them). */
export async function getPendingInvitations(teamId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, role, expires_at, created_at")
    .eq("team_id", teamId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export type PendingInvitation = Awaited<ReturnType<typeof getPendingInvitations>>[number];

/** Invitation details for /invite/[token], or null if the token is unknown. */
export async function getInvitationByToken(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invitation", { p_token: token });
  if (error) throw error;
  return data?.[0] ?? null;
}
