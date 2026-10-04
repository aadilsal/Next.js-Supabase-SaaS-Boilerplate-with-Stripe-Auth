"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, UserPlus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/use-action";
import { inviteMember } from "../actions";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "../lib/permissions";
import { inviteMemberSchema, type InviteMemberInput } from "../schemas";

export function InviteMemberDialog({ teamSlug }: { teamSlug: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<{ email: string; inviteUrl: string; emailSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { teamSlug, email: "", role: "member" },
  });
  const { execute, isPending } = useAction(inviteMember, {
    form,
    onSuccess: (data) => setSent({ email: form.getValues("email"), ...data }),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      setSent(null);
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        {sent ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Invitation created</DialogTitle>
              <DialogDescription>
                {sent.emailSent
                  ? `We emailed an invitation to ${sent.email}. You can also share this link with them:`
                  : `We couldn't send the email. Share this link with ${sent.email} instead:`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Input readOnly value={sent.inviteUrl} aria-label="Invitation link" onFocus={(e) => e.target.select()} />
              <Button
                variant="outline"
                size="icon"
                aria-label="Copy link"
                onClick={async () => {
                  await navigator.clipboard.writeText(sent.inviteUrl);
                  setCopied(true);
                }}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSent(null)}>
                Invite someone else
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(execute)} className="space-y-6" noValidate>
            <DialogHeader>
              <DialogTitle>Invite a team member</DialogTitle>
              <DialogDescription>They&apos;ll get an email with a link to join. Links expire after 7 days.</DialogDescription>
            </DialogHeader>
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="colleague@company.com"
              autoFocus
            />
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="invite-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["member", "admin"] as const).map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>{ROLE_DESCRIPTIONS[field.value]}</FieldDescription>
                </Field>
              )}
            />
            <DialogFooter>
              <SubmitButton pending={isPending}>Send invitation</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
