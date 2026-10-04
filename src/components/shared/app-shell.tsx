import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu, type UserMenuUser } from "./user-menu";

/**
 * Sidebar + top bar + content. Used by the app (/dashboard, /account) and the
 * admin panel (/admin) with different sidebars.
 */
export function AppShell({
  sidebar,
  user,
  badge,
  children,
}: {
  sidebar: ReactNode;
  user: UserMenuUser;
  /** Shown in the top bar, e.g. an "Admin" badge. */
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          {badge}
          <div className="ml-auto flex items-center gap-2">
            <UserMenu user={user} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
