import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/env";
import type { Database } from "@/types/database";

/**
 * ⚠️  SERVICE ROLE client: it BYPASSES Row Level Security.
 *
 * Only use it where there is no signed-in user, or where you deliberately need
 * to cross tenant boundaries:
 *   - the Stripe webhook
 *   - the platform admin panel (after requirePlatformAdmin())
 *   - system jobs (welcome email bookkeeping, account deletion)
 *
 * Leave a comment at every call site explaining why it's needed.
 */
export function createAdminClient() {
  return createClient<Database>(
    publicEnv().NEXT_PUBLIC_SUPABASE_URL,
    serverEnv().SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
