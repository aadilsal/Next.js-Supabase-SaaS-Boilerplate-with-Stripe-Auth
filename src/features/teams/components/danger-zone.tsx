"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "@/hooks/use-action";
import { deleteTeam, leaveTeam } from "../actions";

export function DangerZone({
  team,
  canDelete,
}: {
  team: { name: string; slug: string };
  canDelete: boolean;
}) {
  const leave = useAction(leaveTeam, { successMessage: `You left ${team.name}` });
  const remove = useAction(deleteTeam, { successMessage: `${team.name} was deleted` });

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
        <CardDescription>These actions can&apos;t be undone.</CardDescription>
      </CardHeader>
      <div className="divide-y border-t">
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Leave team</p>
            <p className="text-sm text-muted-foreground">You&apos;ll lose access until someone invites you again.</p>
          </div>
          <ConfirmDialog
            trigger={
              <Button variant="outline" disabled={leave.isPending}>
                Leave team
              </Button>
            }
            title={`Leave ${team.name}?`}
            description="You'll lose access to this team's data immediately."
            confirmLabel="Leave team"
            destructive
            onConfirm={() => leave.execute({ teamSlug: team.slug })}
          />
        </div>
        {canDelete && (
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Delete team</p>
              <p className="text-sm text-muted-foreground">Permanently delete the team and all of its data.</p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="destructive" disabled={remove.isPending}>
                  Delete team
                </Button>
              }
              title={`Delete ${team.name}?`}
              description="This permanently deletes the team, its members' access and all of its data."
              confirmLabel="Delete team"
              confirmText={team.name}
              destructive
              onConfirm={() => remove.execute({ teamSlug: team.slug })}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
