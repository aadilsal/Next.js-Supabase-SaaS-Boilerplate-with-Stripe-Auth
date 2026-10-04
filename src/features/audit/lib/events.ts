/**
 * Every audit event the app records, with a human-readable label.
 * Add new events here; `recordAuditEvent()` only accepts these keys.
 * Format: "<area>.<what_happened>" in snake_case (enforced by a DB check).
 */
export const AUDIT_EVENTS = {
  "auth.signed_in": "Signed in",
  "auth.sign_in_failed": "Failed sign-in attempt",
  "auth.signed_up": "Created an account",
  "auth.magic_link_requested": "Requested a sign-in link",
  "auth.password_reset_requested": "Requested a password reset",
  "auth.password_changed": "Changed password",
  "auth.signed_out_everywhere": "Signed out of all sessions",
  "account.profile_updated": "Updated profile",
  "account.deleted": "Deleted account",
  "team.created": "Created team",
  "team.updated": "Updated team settings",
  "team.deleted": "Deleted team",
  "team.member_invited": "Invited a member",
  "team.invitation_revoked": "Revoked an invitation",
  "team.invitation_accepted": "Joined the team",
  "team.member_role_changed": "Changed a member's role",
  "team.member_removed": "Removed a member",
  "team.member_left": "Left the team",
  "billing.checkout_started": "Started checkout",
  "billing.portal_opened": "Opened the billing portal",
  "billing.subscription_updated": "Subscription changed",
  "billing.purchase_completed": "Completed a purchase",
  "billing.purchase_refunded": "Purchase refunded",
  "admin.user_banned": "Banned a user",
  "admin.user_unbanned": "Unbanned a user",
} as const;

export type AuditAction = keyof typeof AUDIT_EVENTS;

export function auditEventLabel(action: string): string {
  return AUDIT_EVENTS[action as AuditAction] ?? action;
}
