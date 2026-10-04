import { NextResponse, type NextRequest } from "next/server";
import { recordAuditEvent } from "@/features/audit/record";
import { maybeSendWelcomeEmail } from "@/features/auth/lib/welcome";
import { logger } from "@/lib/logger";
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
      if (data.user) {
        await recordAuditEvent({
          action: "auth.signed_in",
          actor: data.user,
          metadata: { method: data.user.app_metadata.provider ?? "oauth" },
        });
        await maybeSendWelcomeEmail(data.user);
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
    logger.warn("auth.oauth_callback_failed", { reason: error.code ?? error.message });
  } else if (searchParams.get("error")) {
    // The provider sent the user back with an error (e.g. they cancelled).
    logger.warn("auth.oauth_provider_error", {
      reason: searchParams.get("error_description") ?? searchParams.get("error"),
    });
  }

  return NextResponse.redirect(new URL("/sign-in?error=oauth_failed", request.url));
}
