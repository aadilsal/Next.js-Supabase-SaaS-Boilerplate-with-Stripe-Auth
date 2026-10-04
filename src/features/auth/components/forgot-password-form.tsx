"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { useAction } from "@/hooks/use-action";
import { requestPasswordReset } from "../actions";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas";
import { CheckEmail } from "./check-email";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { execute, isPending } = useAction(requestPasswordReset, {
    form,
    onSuccess: () => setSentTo(form.getValues("email")),
  });

  if (sentTo) {
    return (
      <CheckEmail
        email={sentTo}
        message="If an account exists, we sent a reset link to"
        onResend={() => execute(form.getValues())}
        onBack={() => setSentTo(null)}
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(execute)} className="space-y-4" noValidate>
      <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
      <SubmitButton pending={isPending} className="w-full">
        Send reset link
      </SubmitButton>
    </form>
  );
}
