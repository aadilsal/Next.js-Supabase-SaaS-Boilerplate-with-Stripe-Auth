"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { teamPath } from "@/config/navigation";
import { useAction } from "@/hooks/use-action";
import { createTeam } from "../actions";
import { createTeamSchema, type CreateTeamInput } from "../schemas";

export function CreateTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "" },
  });
  const { execute, isPending } = useAction(createTeam, {
    form,
    successMessage: "Team created",
    onSuccess: ({ slug }) => {
      onOpenChange(false);
      form.reset();
      router.push(teamPath(slug));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(execute)} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Create a team</DialogTitle>
            <DialogDescription>
              Teams share billing and data. You can invite people after creating it.
            </DialogDescription>
          </DialogHeader>
          <TextField control={form.control} name="name" label="Team name" placeholder="Acme Inc." autoFocus />
          <DialogFooter>
            <SubmitButton pending={isPending}>Create team</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
