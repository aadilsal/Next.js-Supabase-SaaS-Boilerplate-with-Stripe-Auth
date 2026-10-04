"use client";

import Link from "next/link";
import { useTransition } from "react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { AuthCard } from "@/features/auth/components/auth-card";
import { useAction } from "@/hooks/use-action";
import type { TeamRole } from "@/types/database";
import { acceptInvitation } from "../actions";
import { ROLE_LABELS } from "../lib/permissions";

export function AcceptInviteCard({
  token,
  invitation,
  currentEmail,
}: {
  token: string;
  invitation: { team_name: string; inviter_name: string; email: string; role: TeamRole };
  currentEmail: string;
}) {
  const { execute, isPending } = useAction(acceptInvitation);
  const [isSigningOut, startSignOut] = useTransition();
  const emailMatches = invitation.email.toLowerCase() === currentEmail.toLowerCase();

  return (
    <AuthCard
      title={`Join ${invitation.team_name}`}
      description={`${invitation.inviter_name} invited you to join as ${ROLE_LABELS[invitation.role].toLowerCase()}.`}
    >
      {emailMatches ? (
        <div className="flex flex-col gap-2">
          <SubmitButton type="button" pending={isPending} onClick={() => execute({ token })}>
            Accept invitation
          </SubmitButton>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Decline</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              This invitation was sent to <strong>{invitation.email}</strong>, but you&apos;re signed in as{" "}
              <strong>{currentEmail}</strong>. Sign in with the invited address to accept it.
            </AlertDescription>
          </Alert>
          <SubmitButton
            type="button"
            variant="outline"
            className="w-full"
            pending={isSigningOut}
            onClick={() => startSignOut(() => signOut())}
          >
            Sign out and switch account
          </SubmitButton>
        </div>
      )}
    </AuthCard>
  );
}
