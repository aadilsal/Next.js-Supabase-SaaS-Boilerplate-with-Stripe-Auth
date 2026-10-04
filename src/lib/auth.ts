import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { features } from "@/config/features";
import { createClient } from "@/lib/supabase/server";

/**
 * The verified current user, or null. Uses getUser(), which validates the JWT
 * with Supabase. Never authorize with getSession() on the server.
 * Wrapped in React `cache` so it runs once per request.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The current user, or redirect to sign-in. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** The current user's profile row (RLS: users can always read their own). */
export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

/**
 * Gate for everything under /admin. Returns 404 (not 403) to non-admins so the
 * admin panel's existence isn't revealed. Call it in EVERY admin query and
 * action, not just the layout.
 */
export async function requirePlatformAdmin() {
  if (!features.admin) notFound();
  const user = await requireUser();
  const profile = await getProfile();
  if (!profile?.is_platform_admin) notFound();
  return { user, profile };
}
