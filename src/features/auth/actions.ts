"use server";

import { redirect } from "next/navigation";
import { features } from "@/config/features";
import { siteConfig } from "@/config/site";
import { recordAuditEvent } from "@/features/audit/record";
import { logger } from "@/lib/logger";
import { safeRedirectPath } from "@/lib/redirect";
import { ActionError, authAction, publicAction } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  magicLinkSchema,
  oauthSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";

/** Absolute URL of our email-link handler, carrying a safe `next` path. */
function confirmUrl(next: string): string {
  return `${siteConfig.url}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export const signInWithPassword = publicAction(signInSchema, async ({ input, supabase }) => {
  if (!features.auth.password) throw new ActionError("Password sign-in is disabled.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    // Failed sign-ins are tracked so you can spot brute-force attempts (/admin/logs, /admin/audit-logs).
    logger.warn("auth.sign_in_failed", { email: input.email, reason: error.code ?? error.message });
    await recordAuditEvent({
      action: "auth.sign_in_failed",
      target: { type: "email", id: input.email.toLowerCase() },
      metadata: { method: "password", reason: error.code ?? "unknown" },
    });
    if (error.code === "email_not_confirmed") {
      throw new ActionError("Please confirm your email first. Check your inbox for the link.");
    }
    throw new ActionError("Incorrect email or password.");
  }

  await recordAuditEvent({ action: "auth.signed_in", actor: data.user, metadata: { method: "password" } });
  redirect(safeRedirectPath(input.next));
});

export const signUpWithPassword = publicAction(signUpSchema, async ({ input, supabase }) => {
  if (!features.auth.password) throw new ActionError("Password sign-up is disabled.");

  const next = safeRedirectPath(input.next);
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: confirmUrl(next),
      data: { full_name: input.fullName },
    },
  });
  if (error) {
    if (error.code === "weak_password") throw new ActionError(error.message);
    if (error.code === "over_email_send_rate_limit") {
      throw new ActionError("Too many attempts. Please wait a minute and try again.");
    }
    logger.error("auth.sign_up_failed", { error, email: input.email });
    throw new ActionError("Couldn't create your account. Please try again.");
  }

  // Supabase returns a user with no identities when the email is already registered.
  if (data.user && data.user.identities?.length) {
    await recordAuditEvent({ action: "auth.signed_up", actor: data.user, metadata: { method: "password" } });
  }

  // Email confirmation turned off in Supabase: the user is signed in already.
  if (data.session) redirect(next);
  return { needsConfirmation: true as const };
});

export const sendMagicLink = publicAction(magicLinkSchema, async ({ input, supabase }) => {
  if (!features.auth.magicLink) throw new ActionError("Magic link sign-in is disabled.");

  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: { emailRedirectTo: confirmUrl(safeRedirectPath(input.next)), shouldCreateUser: true },
  });
  if (error) {
    if (error.code === "over_email_send_rate_limit") {
      throw new ActionError("Please wait a minute before requesting another link.");
    }
    logger.error("auth.magic_link_failed", { error, email: input.email });
    throw new ActionError("Couldn't send the link. Please try again.");
  }

  await recordAuditEvent({
    action: "auth.magic_link_requested",
    target: { type: "email", id: input.email.toLowerCase() },
  });
  return { sent: true as const };
});

/** Returns the provider's URL; the browser then navigates there. */
export const signInWithOAuth = publicAction(oauthSchema, async ({ input, supabase }) => {
  if (input.provider === "google" && !features.auth.google) {
    throw new ActionError("Google sign-in is disabled.");
  }
  const next = safeRedirectPath(input.next);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: input.provider,
    options: { redirectTo: `${siteConfig.url}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) {
    logger.error("auth.oauth_start_failed", { error, provider: input.provider });
    throw new ActionError("Couldn't connect to Google. Please try again.");
  }
  return { url: data.url };
});

export const requestPasswordReset = publicAction(forgotPasswordSchema, async ({ input, supabase }) => {
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: confirmUrl("/reset-password"),
  });
  // Never reveal whether an account exists. Only surface rate limiting.
  if (error?.code === "over_email_send_rate_limit") {
    throw new ActionError("Please wait a minute before requesting another email.");
  }
  if (error) logger.error("auth.password_reset_failed", { error, email: input.email });

  await recordAuditEvent({
    action: "auth.password_reset_requested",
    target: { type: "email", id: input.email.toLowerCase() },
  });
  return { sent: true as const };
});

/** Sets a new password. The recovery link has already signed the user in. */
export const resetPassword = authAction(resetPasswordSchema, async ({ input, user, supabase }) => {
  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) {
    if (error.code === "same_password") {
      throw new ActionError("Choose a password you haven't used before.");
    }
    throw new ActionError(error.message);
  }

  await recordAuditEvent({ action: "auth.password_changed", actor: user, metadata: { via: "reset_link" } });
  redirect("/dashboard");
});

/** Plain form action: <form action={signOut}><button>Sign out</button></form> */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
