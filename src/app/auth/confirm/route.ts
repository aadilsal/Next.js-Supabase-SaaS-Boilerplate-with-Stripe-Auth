import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { recordAuditEvent } from "@/features/audit/record";
import { maybeSendWelcomeEmail } from "@/features/auth/lib/welcome";
import { logger } from "@/lib/logger";
import { safeRedirectPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles links from auth emails (confirm sign-up, magic link, password reset):
 *   /auth/confirm?token_hash=...&type=email|recovery&next=/somewhere
 * The templates in supabase/templates/*.html point here.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(
    searchParams.get("next"),
    type === "recovery" ? "/reset-password" : "/dashboard",
  );

  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (data.user && type !== "recovery") {
        await recordAuditEvent({ action: "auth.signed_in", actor: data.user, metadata: { method: "email_link" } });
        await maybeSendWelcomeEmail(data.user);
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
    logger.warn("auth.email_link_invalid", { type, reason: error.code ?? error.message });
  }

  return NextResponse.redirect(new URL("/sign-in?error=link_invalid", request.url));
}
