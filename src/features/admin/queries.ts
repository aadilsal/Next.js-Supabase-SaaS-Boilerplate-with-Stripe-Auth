import "server-only";

import { resolveEntitlements } from "@/features/billing/lib/entitlements";
import { requirePlatformAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const ADMIN_PAGE_SIZE = 20;

/** Escape LIKE wildcards in user-typed search text. */
function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

// Every function here calls requirePlatformAdmin() itself and uses the service
// role client, because the admin panel deliberately reads across all tenants.

export async function getAdminStats() {
  await requirePlatformAdmin();
  const admin = createAdminClient();
  const count = { count: "exact", head: true } as const;

  const [users, teams, subscriptions, purchases] = await Promise.all([
    admin.from("profiles").select("id", count),
    admin.from("teams").select("id", count).eq("is_personal", false),
    admin.from("subscriptions").select("id", count).in("status", ["active", "trialing"]),
    admin.from("purchases").select("id", count).eq("status", "paid"),
  ]);

  return {
    users: users.count ?? 0,
    teams: teams.count ?? 0,
    activeSubscriptions: subscriptions.count ?? 0,
    lifetimePurchases: purchases.count ?? 0,
  };
}

export async function listUsers({ query = "", page = 1 }: { query?: string; page?: number }) {
  await requirePlatformAdmin();
  const admin = createAdminClient();
  const from = (page - 1) * ADMIN_PAGE_SIZE;

  let request = admin
    .from("profiles")
    .select("id, email, full_name, avatar_url, is_platform_admin, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);
  if (query) request = request.ilike("email", likePattern(query));

  const { data, count, error } = await request;
  if (error) throw error;

  // Ban status lives in auth.users, which PostgREST doesn't expose.
  const users = await Promise.all(
    (data ?? []).map(async (profile) => {
      const { data: auth } = await admin.auth.admin.getUserById(profile.id);
      const bannedUntil = auth.user?.banned_until;
      return {
        ...profile,
        lastSignInAt: auth.user?.last_sign_in_at ?? null,
        isBanned: Boolean(bannedUntil && new Date(bannedUntil) > new Date()),
      };
    }),
  );

  return { users, total: count ?? 0 };
}

export type AdminUser = Awaited<ReturnType<typeof listUsers>>["users"][number];

export async function listTeams({ query = "", page = 1 }: { query?: string; page?: number }) {
  await requirePlatformAdmin();
  const admin = createAdminClient();
  const from = (page - 1) * ADMIN_PAGE_SIZE;

  let request = admin
    .from("teams")
    .select("id, name, slug, is_personal, created_at, team_members(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);
  if (query) request = request.ilike("name", likePattern(query));

  const { data, count, error } = await request;
  if (error) throw error;

  const teamIds = (data ?? []).map((team) => team.id);
  const [subscriptions, purchases] = await Promise.all([
    admin
      .from("subscriptions")
      .select("id, team_id, status, price_id, interval, current_period_end, cancel_at_period_end")
      .in("team_id", teamIds),
    admin.from("purchases").select("team_id, price_id, status").in("team_id", teamIds),
  ]);

  const teams = (data ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    slug: team.slug,
    isPersonal: team.is_personal,
    createdAt: team.created_at,
    memberCount: team.team_members[0]?.count ?? 0,
    plan: resolveEntitlements({
      subscriptions: (subscriptions.data ?? []).filter((s) => s.team_id === team.id),
      purchases: (purchases.data ?? []).filter((p) => p.team_id === team.id),
    }).plan.name,
  }));

  return { teams, total: count ?? 0 };
}

export type AdminTeam = Awaited<ReturnType<typeof listTeams>>["teams"][number];
