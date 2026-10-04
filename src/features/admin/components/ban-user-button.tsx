"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { setUserBanned } from "../actions";

export function BanUserButton({ userId, email, isBanned }: { userId: string; email: string; isBanned: boolean }) {
  const { execute, isPending } = useAction(setUserBanned, {
    successMessage: isBanned ? `${email} unbanned` : `${email} banned`,
  });

  if (isBanned) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => execute({ userId, banned: false })}
      >
        Unban
      </Button>
    );
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive" disabled={isPending}>
          Ban
        </Button>
      }
      title={`Ban ${email}?`}
      description="They will be signed out and unable to sign in until unbanned."
      confirmLabel="Ban user"
      destructive
      onConfirm={() => execute({ userId, banned: true })}
    />
  );
}
