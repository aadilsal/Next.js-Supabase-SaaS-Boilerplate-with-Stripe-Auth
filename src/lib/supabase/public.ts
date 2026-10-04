import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/env";
import type { Database } from "@/types/database";

/**
 * Anonymous, cookie-free client for PUBLIC data (the product catalog).
 * It acts as the `anon` role, so RLS applies. Because it doesn't read cookies,
 * pages that use it can be statically cached (ISR).
 */
export function createPublicClient() {
  const env = publicEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
