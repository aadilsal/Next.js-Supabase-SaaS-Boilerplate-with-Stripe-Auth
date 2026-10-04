"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LogoMark } from "@/components/shared/logo";
import { features } from "@/config/features";
import { teamPath } from "@/config/navigation";
import type { TeamRole } from "@/types/database";
import { CreateTeamDialog } from "./create-team-dialog";

export interface SwitcherTeam {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  role: TeamRole;
  planName: string;
}

export function TeamSwitcher({ teams, activeTeam }: { teams: SwitcherTeam[]; activeTeam: SwitcherTeam }) {
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = features.teams.enabled && features.teams.allowCreate;

  const current = (
    <>
      <LogoMark className="size-8" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{activeTeam.name}</span>
        <span className="truncate text-xs text-muted-foreground">{activeTeam.planName}</span>
      </div>
    </>
  );

  // Teams switched off: just show the workspace, no switcher.
  if (!features.teams.enabled) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href={teamPath(activeTeam.slug)}>{current}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {current}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem key={team.id} asChild>
                <Link href={teamPath(team.slug)}>
                  <span className="truncate">{team.name}</span>
                  {team.id === activeTeam.id && <Check className="ml-auto size-4" />}
                </Link>
              </DropdownMenuItem>
            ))}
            {canCreate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
                  <Plus className="size-4" />
                  Create team
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {canCreate && <CreateTeamDialog open={createOpen} onOpenChange={setCreateOpen} />}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
