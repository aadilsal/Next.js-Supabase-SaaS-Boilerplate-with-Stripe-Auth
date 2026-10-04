import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Set a new password" };

/** Reached from the password reset email, which signs the user in first. */
export default async function ResetPasswordPage() {
  const user = await getUser();

  if (!user) {
    return (
      <AuthCard title="Link expired" description="This password reset link is invalid or has expired.">
        <Button className="w-full" asChild>
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" description={`For ${user.email}`}>
      <ResetPasswordForm />
    </AuthCard>
  );
}
