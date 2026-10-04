"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "@/hooks/use-action";
import { changePassword, deleteAccount, signOutEverywhere } from "../actions";
import { changePasswordSchema, type ChangePasswordInput } from "../schemas";

const PROVIDER_LABELS: Record<string, string> = { email: "Email", google: "Google" };

export function SecuritySettings({ providers }: { providers: string[] }) {
  return (
    <>
      <PasswordCard hasPassword={providers.includes("email")} />
      <SessionsCard providers={providers} />
      <DeleteAccountCard />
    </>
  );
}

function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { execute, isPending } = useAction(changePassword, {
    form,
    successMessage: "Password updated",
    onSuccess: () => form.reset(),
  });

  return (
    <Card>
      <form onSubmit={form.handleSubmit(execute)} noValidate>
        <CardHeader>
          <CardTitle>{hasPassword ? "Change password" : "Set a password"}</CardTitle>
          <CardDescription>
            {hasPassword
              ? "Use at least 8 characters."
              : "Add a password so you can also sign in with your email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          <TextField
            control={form.control}
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
          />
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
          />
        </CardContent>
        <CardFooter className="justify-end">
          <SubmitButton pending={isPending}>Update password</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}

function SessionsCard({ providers }: { providers: string[] }) {
  const { execute, isPending } = useAction(signOutEverywhere);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-in methods & sessions</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          Connected:
          {providers.map((provider) => (
            <Badge key={provider} variant="secondary">
              {PROVIDER_LABELS[provider] ?? provider}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between gap-4">
        <p className="text-sm text-muted-foreground">Signed in somewhere you don&apos;t recognise?</p>
        <SubmitButton type="button" variant="outline" pending={isPending} onClick={() => execute({})}>
          Sign out everywhere
        </SubmitButton>
      </CardFooter>
    </Card>
  );
}

function DeleteAccountCard() {
  const { execute, isPending } = useAction(deleteAccount);
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Permanently delete your account, your personal workspace and any team where you&apos;re the only
          member. Active subscriptions on those teams are canceled.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" disabled={isPending}>
              Delete account
            </Button>
          }
          title="Delete your account?"
          description="This can't be undone."
          confirmLabel="Delete account"
          confirmText="DELETE"
          destructive
          onConfirm={() => execute({ confirm: "DELETE" })}
        />
      </CardFooter>
    </Card>
  );
}
