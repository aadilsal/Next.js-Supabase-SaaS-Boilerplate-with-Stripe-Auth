import "server-only";

import type { User } from "@supabase/supabase-js";
import { features } from "@/config/features";
import { sendWelcomeEmail } from "@/features/email/send";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Sends the welcome email once per user, after their first confirmed sign-in.
 * Safe to call on every sign-in: the profile row is "claimed" atomically, so
 * concurrent requests can't send it twice. Never throws.
 */
export async function maybeSendWelcomeEmail(user: User): Promise<void> {
  if (!features.welcomeEmail || !user.email) return;

  try {
    // Service role: welcome_email_sent_at isn't user-writable (column grants).
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", user.id)
      .is("welcome_email_sent_at", null)
      .select("full_name");

    const profile = data?.[0];
    if (profile) await sendWelcomeEmail({ to: user.email, name: profile.full_name });
  } catch (error) {
    console.error("[auth] Welcome email failed:", error);
  }
}
