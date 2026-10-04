import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Pages that need a signed-in user. */
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/admin", "/invite"];
/** Pages a signed-in user doesn't need to see. */
const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];

/**
 * Runs before every page request (Next.js 16 "proxy", formerly middleware).
 *
 * This is a CONVENIENCE redirect, not a security boundary. Every protected
 * page and Server Action checks the user again on the server.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // Keep any refreshed session cookies.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isProtected && !user) {
    const next = encodeURIComponent(pathname + search);
    return redirectTo(`/sign-in?next=${next}`);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    return redirectTo("/dashboard");
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static files, images and the Stripe webhook.
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
