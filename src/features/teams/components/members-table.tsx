"use client";

import { UserMinus } from "lucide-react";
import { RoleBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAction } from "@/hooks/use-action";
import type { TeamRole } from "@/types/database";
import { removeMember, updateMemberRole } from "../actions";
import { assignableRoles, canChangeRole, canRemoveMember, ROLE_LABELS } from "../lib/permissions";
import type { TeamMember } from "../queries";

export function MembersTable({
  teamSlug,
  members,
  currentUserId,
  currentRole,
}: {
  teamSlug: string;
  members: TeamMember[];
  currentUserId: string;
  currentRole: TeamRole;
}) {
  const changeRole = useAction(updateMemberRole, { successMessage: "Role updated" });
  const remove = useAction(removeMember, { successMessage: "Member removed" });

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="w-44">Role</TableHead>
            <TableHead className="w-16">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            const roleOptions = assignableRoles(currentRole).filter(
              (role) => role === member.role || canChangeRole(currentRole, member.role, role),
            );
            const canEditRole = !isSelf && roleOptions.length > 1;

            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={member.fullName} email={member.email} src={member.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {member.fullName ?? member.email}
                        {isSelf && <span className="ml-1 text-muted-foreground">(you)</span>}
                      </p>
                      {member.fullName && (
                        <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canEditRole ? (
                    <Select
                      value={member.role}
                      disabled={changeRole.isPending}
                      onValueChange={(role) =>
                        changeRole.execute({ teamSlug, userId: member.userId, role: role as TeamRole })
                      }
                    >
                      <SelectTrigger className="w-36" aria-label={`Role for ${member.email}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <RoleBadge role={member.role} />
                  )}
                </TableCell>
                <TableCell>
                  {!isSelf && canRemoveMember(currentRole, member.role) && (
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Remove ${member.email}`}>
                          <UserMinus className="size-4" />
                        </Button>
                      }
                      title="Remove member?"
                      description={`${member.fullName ?? member.email} will lose access to this team.`}
                      confirmLabel="Remove"
                      destructive
                      onConfirm={() => remove.execute({ teamSlug, userId: member.userId })}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
