import {
  CreditCard,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { TeamRole } from "@/types/database";

export interface NavItem {
  title: string;
  /** Path relative to the team, e.g. "/settings" -> /dashboard/<team>/settings */
  path: string;
  icon: LucideIcon;
  /** Only show to these roles. Omit to show to everyone. */
  roles?: TeamRole[];
  /** Only show when this feature is enabled (src/config/features.ts / observability.ts). */
  requires?: "teams" | "billing" | "auditLog";
}

/**
 * Sidebar navigation. Add your product's pages to `main`.
 * Hiding an item here does NOT protect the page; pages check roles themselves.
 */
export const appNavigation: { main: NavItem[]; settings: NavItem[] } = {
  main: [{ title: "Dashboard", path: "", icon: LayoutDashboard }],
  settings: [
    { title: "General", path: "/settings", icon: Settings },
    { title: "Members", path: "/settings/members", icon: Users, requires: "teams" },
    { title: "Billing", path: "/settings/billing", icon: CreditCard, requires: "billing" },
    {
      title: "Audit log",
      path: "/settings/audit-log",
      icon: ScrollText,
      roles: ["owner", "admin"],
      requires: "auditLog",
    },
  ],
};

export function teamPath(teamSlug: string, path = ""): string {
  return `/dashboard/${teamSlug}${path}`;
}
