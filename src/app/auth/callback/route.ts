import { NextResponse, type NextRequest } from "next/server";
import { maybeSendWelcomeEmail } from "@/features/auth/lib/welcome";
import { safeRedirectPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth return URL (e.g. "Continue with Google"):
 *   /auth/callback?code=...&next=/somewhere
 * Exchanges the one-time code for a session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.user) await maybeSendWelcomeEmail(data.user);
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.warn("[auth] OAuth code exchange failed:", error.message);
  }

  return NextResponse.redirect(new URL("/sign-in?error=oauth_failed", request.url));
}
