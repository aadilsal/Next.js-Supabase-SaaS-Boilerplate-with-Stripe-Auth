"use client";

import { RoleBadge, StatusBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAction } from "@/hooks/use-action";
import { revokeInvitation } from "../actions";
import type { PendingInvitation } from "../queries";

export function PendingInvitations({
  teamSlug,
  invitations,
}: {
  teamSlug: string;
  invitations: PendingInvitation[];
}) {
  const revoke = useAction(revokeInvitation, { successMessage: "Invitation revoked" });

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Pending invitations</h2>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const expired = new Date(invitation.expires_at) < new Date();
              return (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={invitation.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={expired ? "expired" : "pending"} />
                  </TableCell>
                  <TableCell>
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="sm">
                          Revoke
                        </Button>
                      }
                      title="Revoke invitation?"
                      description={`The link sent to ${invitation.email} will stop working.`}
                      confirmLabel="Revoke"
                      destructive
                      onConfirm={() => revoke.execute({ teamSlug, invitationId: invitation.id })}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
