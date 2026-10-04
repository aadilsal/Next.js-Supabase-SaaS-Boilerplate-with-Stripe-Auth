import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
