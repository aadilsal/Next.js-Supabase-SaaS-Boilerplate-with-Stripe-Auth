import type { TeamRole } from "@/types/database";

/**
 * Role rules used by the UI (to hide buttons) and Server Actions (for
 * friendly errors). The database enforces the same rules with RLS + triggers.
 * See docs/architecture.md §5 for the role matrix.
 */

export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: "Full access, including billing and deleting the team.",
  admin: "Can manage team settings and members.",
  member: "Can use the product.",
};

export function canEditTeam(role: TeamRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageMembers(role: TeamRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: TeamRole): boolean {
  return role === "owner";
}

export function canDeleteTeam(role: TeamRole, isPersonal: boolean): boolean {
  return role === "owner" && !isPersonal;
}

/** Can `actor` change a member from `from` to `to`? Admins can't touch owners. */
export function canChangeRole(actor: TeamRole, from: TeamRole, to: TeamRole): boolean {
  if (!canManageMembers(actor) || from === to) return false;
  if (actor === "owner") return true;
  return from !== "owner" && to !== "owner";
}

/** Roles `actor` may assign when changing someone else's role. */
export function assignableRoles(actor: TeamRole): TeamRole[] {
  return actor === "owner" ? ["owner", "admin", "member"] : actor === "admin" ? ["admin", "member"] : [];
}

/** Can `actor` remove a member who has `target` role? (Leaving is separate.) */
export function canRemoveMember(actor: TeamRole, target: TeamRole): boolean {
  if (!canManageMembers(actor)) return false;
  return actor === "owner" || target !== "owner";
}
