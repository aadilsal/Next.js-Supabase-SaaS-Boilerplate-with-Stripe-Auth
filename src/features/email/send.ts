import "server-only";

import type { ReactElement } from "react";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env";
import { logger } from "@/lib/logger";
import TeamInviteEmail from "../../../emails/team-invite";
import WelcomeEmail from "../../../emails/welcome";

let resend: Resend | undefined;

/**
 * Sends one email through Resend.
 *
 * Without RESEND_API_KEY (e.g. local development) the email is logged to the
 * console instead, so every flow still works before email is set up.
 * To switch providers, rewrite this one function.
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<void> {
  const { RESEND_API_KEY, EMAIL_FROM } = serverEnv();

  if (!RESEND_API_KEY) {
    logger.info("email.skipped_no_provider", {
      message: `RESEND_API_KEY is not set. Would have sent "${subject}".`,
      to,
    });
    return;
  }

  resend ??= new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, react });
  if (error) throw new Error(`Email to ${to} failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// One helper per email, so callers never assemble subjects or props by hand.
// ---------------------------------------------------------------------------

export function sendWelcomeEmail({ to, name }: { to: string; name?: string | null }) {
  return sendEmail({
    to,
    subject: `Welcome to ${siteConfig.name}`,
    react: WelcomeEmail({ name: name ?? undefined, dashboardUrl: `${siteConfig.url}/dashboard` }),
  });
}

export function sendTeamInviteEmail(props: {
  to: string;
  teamName: string;
  inviterName: string;
  inviteUrl: string;
}) {
  return sendEmail({
    to: props.to,
    subject: `${props.inviterName} invited you to join ${props.teamName} on ${siteConfig.name}`,
    react: TeamInviteEmail(props),
  });
}
