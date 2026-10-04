import type { Metadata } from "next";
import { AppShell } from "@/components/shared/app-shell";
import { AdminSidebar } from "@/components/shared/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { requirePlatformAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

/**
 * Platform admin panel. Non-admins get a 404 so the panel's existence isn't
 * revealed. Grant access with: pnpm admin:grant you@example.com
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user, profile } = await requirePlatformAdmin();

  return (
    <AppShell
      sidebar={<AdminSidebar />}
      badge={<Badge variant="destructive">Admin</Badge>}
      user={{
        name: profile.full_name,
        email: user.email ?? profile.email,
        avatarUrl: profile.avatar_url,
        isPlatformAdmin: true,
      }}
    >
      {children}
    </AppShell>
  );
}
