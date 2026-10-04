import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/env";
import type { Database } from "@/types/database";

/**
 * The DEFAULT Supabase client. Use it in Server Components, Server Actions
 * and Route Handlers. It acts as the signed-in user, so RLS applies.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components can't set cookies. That's fine: src/proxy.ts
            // refreshes the session on every request.
          }
        },
      },
    },
  );
}

export type ServerClient = Awaited<ReturnType<typeof createClient>>;
