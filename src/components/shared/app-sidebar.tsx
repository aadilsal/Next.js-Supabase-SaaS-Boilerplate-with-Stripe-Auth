"use client";

import { ArrowLeft, Building2, LayoutDashboard, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getFreePlan } from "@/config/billing";
import { features } from "@/config/features";
import { appNavigation, teamPath, type NavItem } from "@/config/navigation";
import { TeamSwitcher, type SwitcherTeam } from "@/features/teams/components/team-switcher";
import { canManageBilling } from "@/features/teams/lib/permissions";
import { Logo } from "./logo";

function NavGroup({
  label,
  items,
  pathname,
}: {
  label?: string;
  items: { title: string; href: string; icon: NavItem["icon"] }[];
  pathname: string;
}) {
  if (items.length === 0) return null;
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/** Sidebar for the main app. The active team comes from the URL. */
export function AppSidebar({
  teams,
  billingEnabled,
}: {
  teams: SwitcherTeam[];
  billingEnabled: boolean;
}) {
  const params = useParams<{ teamSlug?: string }>();
  const pathname = usePathname();
  const activeTeam = teams.find((team) => team.slug === params.teamSlug) ?? teams[0];

  const isVisible = (item: NavItem) => {
    if (item.roles && !item.roles.includes(activeTeam.role)) return false;
    if (item.requires === "teams" && (!features.teams.enabled || activeTeam.isPersonal)) return false;
    if (item.requires === "billing" && !billingEnabled) return false;
    return true;
  };
  const toLinks = (items: NavItem[]) =>
    items.filter(isVisible).map((item) => ({ ...item, href: teamPath(activeTeam.slug, item.path) }));

  const isFree = activeTeam.planName === getFreePlan().name;
  const showUpgrade = billingEnabled && isFree && canManageBilling(activeTeam.role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={teams} activeTeam={activeTeam} />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={toLinks(appNavigation.main)} pathname={pathname} />
        <NavGroup label="Settings" items={toLinks(appNavigation.settings)} pathname={pathname} />
      </SidebarContent>
      {billingEnabled && (
        <SidebarFooter className="group-data-[collapsible=icon]:hidden">
          <div className="space-y-3 rounded-lg border bg-background p-3">
            <div className="text-xs text-muted-foreground">Current plan</div>
            <div className="text-sm font-medium">{activeTeam.planName}</div>
            {showUpgrade && (
              <Button size="sm" className="w-full" asChild>
                <Link href={teamPath(activeTeam.slug, "/settings/billing")}>
                  <Sparkles className="size-4" />
                  Upgrade
                </Link>
              </Button>
            )}
          </div>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}

/** Sidebar for the platform admin panel. */
export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Logo href="/admin" className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup
          items={[
            { title: "Overview", href: "/admin", icon: LayoutDashboard },
            { title: "Users", href: "/admin/users", icon: Users },
            { title: "Teams", href: "/admin/teams", icon: Building2 },
          ]}
          pathname={pathname}
        />
        <NavGroup
          label="Exit"
          items={[{ title: "Back to app", href: "/dashboard", icon: ArrowLeft }]}
          pathname={pathname}
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
