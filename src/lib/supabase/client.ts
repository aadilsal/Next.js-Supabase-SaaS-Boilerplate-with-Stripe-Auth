import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Client Components (e.g. realtime subscriptions).
 * Prefer Server Components + Server Actions for data; reach for this rarely.
 */
export function createClient() {
  const env = publicEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
