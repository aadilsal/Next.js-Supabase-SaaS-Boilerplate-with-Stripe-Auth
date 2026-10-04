"use client";

import { LogOut, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { features } from "@/config/features";
import { signOut } from "@/features/auth/actions";
import { THEME_OPTIONS } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";

export interface UserMenuUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  isPlatformAdmin: boolean;
}

export function UserMenu({ user }: { user: UserMenuUser }) {
  const { theme, setTheme } = useTheme();
  const [isSigningOut, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Open user menu"
      >
        <UserAvatar name={user.name} email={user.email} src={user.avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
          {user.name && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <UserRound className="size-4" />
              Account settings
            </Link>
          </DropdownMenuItem>
          {features.admin && user.isPlatformAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield className="size-4" />
                Admin panel
              </Link>
            </DropdownMenuItem>
          )}
          {features.themeToggle && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      <Icon className="size-4" />
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={() => startTransition(() => signOut())}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
