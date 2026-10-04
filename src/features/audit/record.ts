import "server-only";

import { headers } from "next/headers";
import { observabilityConfig } from "@/config/observability";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import type { AuditAction } from "./lib/events";

export interface AuditEvent {
  action: AuditAction;
  /** Who did it. Omit for system events (e.g. Stripe webhooks). */
  actor?: { id: string; email?: string | null } | null;
  /** The team it happened in. Omit for account-level events. */
  teamId?: string | null;
  /** What it happened to, e.g. { type: "invitation", id: "..." }. */
  target?: { type: string; id: string };
  /** Extra details. Never put secrets, passwords or payment data here. */
  metadata?: Record<string, unknown>;
}

/** Best-effort client IP and user agent. Empty outside a request. */
async function requestDetails() {
  try {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    return {
      ip_address: forwardedFor || h.get("x-real-ip") || null,
      user_agent: h.get("user-agent")?.slice(0, 512) ?? null,
    };
  } catch {
    return { ip_address: null, user_agent: null };
  }
}

/**
 * Appends an entry to the audit log. Call it after an action succeeds.
 *
 *   await recordAuditEvent({ action: "team.member_invited", actor: user, teamId: team.id,
 *                            target: { type: "invitation", id: email } });
 *
 * Never throws: a logging failure must not fail the user's action.
 */
export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  if (!observabilityConfig.auditLog) return;

  try {
    // Service role: audit_logs is append-only and not writable by users, so
    // entries can't be forged, edited or deleted from the browser.
    const { error } = await createAdminClient()
      .from("audit_logs")
      .insert({
        action: event.action,
        actor_id: event.actor?.id ?? null,
        actor_email: event.actor?.email ?? null,
        team_id: event.teamId ?? null,
        target_type: event.target?.type ?? null,
        target_id: event.target?.id ?? null,
        // Round-trip through JSON so only plain, serialisable values are stored.
        metadata: JSON.parse(JSON.stringify(event.metadata ?? {})) as NonNullable<Json>,
        ...(await requestDetails()),
      });
    if (error) throw error;
  } catch (error) {
    logger.error("audit.write_failed", { error, action: event.action, teamId: event.teamId });
  }
}
