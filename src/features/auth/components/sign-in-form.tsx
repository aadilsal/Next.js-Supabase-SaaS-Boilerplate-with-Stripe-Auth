"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { features } from "@/config/features";
import { useAction } from "@/hooks/use-action";
import { sendMagicLink, signInWithPassword } from "../actions";
import {
  magicLinkSchema,
  signInSchema,
  type MagicLinkInput,
  type SignInInput,
} from "../schemas";
import { CheckEmail } from "./check-email";
import { OAuthButtons } from "./oauth-buttons";

type Mode = "password" | "magic-link";

export function SignInForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<Mode>(features.auth.password ? "password" : "magic-link");
  const canSwitch = features.auth.password && features.auth.magicLink;

  return (
    <div className="space-y-6">
      {features.auth.google && (
        <>
          <OAuthButtons next={next} />
          {(features.auth.password || features.auth.magicLink) && <FieldSeparator>or</FieldSeparator>}
        </>
      )}
      {mode === "password" && features.auth.password && <PasswordSignIn next={next} />}
      {mode === "magic-link" && features.auth.magicLink && <MagicLinkSignIn next={next} />}
      {canSwitch && (
        <Button
          variant="link"
          className="w-full"
          onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
        >
          {mode === "password" ? "Email me a sign-in link instead" : "Sign in with a password instead"}
        </Button>
      )}
    </div>
  );
}

function PasswordSignIn({ next }: { next?: string }) {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", next },
  });
  const { execute, isPending } = useAction(signInWithPassword, { form });

  return (
    <form onSubmit={form.handleSubmit(execute)} className="space-y-4" noValidate>
      <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
      <TextField
        control={form.control}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        labelAction={
          <Link href="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        }
      />
      <SubmitButton pending={isPending} className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}

function MagicLinkSignIn({ next }: { next?: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "", next },
  });
  const { execute, isPending } = useAction(sendMagicLink, {
    form,
    onSuccess: () => setSentTo(form.getValues("email")),
  });

  if (sentTo) {
    return (
      <CheckEmail
        email={sentTo}
        message="We sent a sign-in link to"
        onResend={() => execute(form.getValues())}
        onBack={() => setSentTo(null)}
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(execute)} className="space-y-4" noValidate>
      <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
      <SubmitButton pending={isPending} className="w-full">
        Email me a sign-in link
      </SubmitButton>
    </form>
  );
}
