import "server-only";

import { requirePlatformAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const AUDIT_PAGE_SIZE = 25;

function pageRange(page: number) {
  const from = (Math.max(1, page) - 1) * AUDIT_PAGE_SIZE;
  return [from, from + AUDIT_PAGE_SIZE - 1] as const;
}

/** Strip characters that have meaning in PostgREST filters or LIKE patterns. */
function searchTerm(query: string): string {
  return query.replace(/[\\%_,()*]/g, " ").trim();
}

/** A team's audit log. RLS: only owners and admins of the team can read it. */
export async function getTeamAuditLogs(teamId: string, page = 1) {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .range(...pageRange(page));
  if (error) throw error;
  return { entries: data ?? [], total: count ?? 0 };
}

/** The signed-in user's own recent activity (RLS: actor_id = auth.uid()). */
export async function getMyRecentActivity(userId: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("actor_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Every audit entry on the platform. Platform admins only. */
export async function listAllAuditLogs({ query = "", page = 1 }: { query?: string; page?: number }) {
  await requirePlatformAdmin();
  // Service role: the admin panel reads across all tenants.
  let request = createAdminClient()
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(...pageRange(page));
  const term = searchTerm(query);
  if (term) request = request.or(`actor_email.ilike.%${term}%,action.ilike.%${term}%`);

  const { data, count, error } = await request;
  if (error) throw error;
  return { entries: data ?? [], total: count ?? 0 };
}

/** Application warnings and errors from the logger. Platform admins only. */
export async function listAppLogs({ level, page = 1 }: { level?: string; page?: number }) {
  await requirePlatformAdmin();
  // Service role: app_logs has no user-facing RLS policies.
  let request = createAdminClient()
    .from("app_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(...pageRange(page));
  if (level) request = request.eq("level", level);

  const { data, count, error } = await request;
  if (error) throw error;
  return { entries: data ?? [], total: count ?? 0 };
}
