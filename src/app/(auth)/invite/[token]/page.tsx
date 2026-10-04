import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AcceptInviteCard } from "@/features/teams/components/accept-invite-card";
import { getInvitationByToken } from "@/features/teams/queries";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Team invitation" };

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  // src/proxy.ts already sends signed-out visitors to sign-in and back here.
  const user = await requireUser();
  const invitation = await getInvitationByToken(token);

  if (!invitation || invitation.status !== "pending") {
    const title =
      invitation?.status === "accepted"
        ? "Invitation already used"
        : invitation?.status === "expired"
          ? "Invitation expired"
          : "Invitation not found";
    return (
      <AuthCard title={title} description="Ask a team admin to send you a new invitation.">
        <Button className="w-full" asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </AuthCard>
    );
  }

  return <AcceptInviteCard token={token} invitation={invitation} currentEmail={user.email ?? ""} />;
}
