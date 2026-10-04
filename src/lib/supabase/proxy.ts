import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/env";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase session cookie on every request and returns the
 * verified user (or null). Used only by src/proxy.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = publicEnv();

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Don't put code between createServerClient and getUser(): it refreshes the token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
