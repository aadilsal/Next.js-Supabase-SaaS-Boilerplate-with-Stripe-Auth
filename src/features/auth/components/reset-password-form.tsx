"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { useAction } from "@/hooks/use-action";
import { resetPassword } from "../actions";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas";

export function ResetPasswordForm() {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { execute, isPending } = useAction(resetPassword, { form, successMessage: "Password updated" });

  return (
    <form onSubmit={form.handleSubmit(execute)} className="space-y-4" noValidate>
      <TextField
        control={form.control}
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        description="At least 8 characters."
      />
      <TextField
        control={form.control}
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
      />
      <SubmitButton pending={isPending} className="w-full">
        Update password
      </SubmitButton>
    </form>
  );
}
