"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { FieldSeparator } from "@/components/ui/field";
import { features } from "@/config/features";
import { useAction } from "@/hooks/use-action";
import { signUpWithPassword } from "../actions";
import { signUpSchema, type SignUpInput } from "../schemas";
import { CheckEmail } from "./check-email";
import { OAuthButtons } from "./oauth-buttons";
import { SignInForm } from "./sign-in-form";

export function SignUpForm({ next }: { next?: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", next },
  });
  const { execute, isPending } = useAction(signUpWithPassword, {
    form,
    onSuccess: () => setSentTo(form.getValues("email")),
  });

  // Password sign-up switched off: magic links and Google create accounts too.
  if (!features.auth.password) return <SignInForm next={next} />;

  if (sentTo) {
    return (
      <CheckEmail
        email={sentTo}
        message="Confirm your account using the link we sent to"
        onBack={() => setSentTo(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {features.auth.google && (
        <>
          <OAuthButtons next={next} />
          <FieldSeparator>or</FieldSeparator>
        </>
      )}
      <form onSubmit={form.handleSubmit(execute)} className="space-y-4" noValidate>
        <TextField control={form.control} name="fullName" label="Name" autoComplete="name" />
        <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
        <TextField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          description="At least 8 characters."
        />
        <SubmitButton pending={isPending} className="w-full">
          Create account
        </SubmitButton>
      </form>
    </div>
  );
}
