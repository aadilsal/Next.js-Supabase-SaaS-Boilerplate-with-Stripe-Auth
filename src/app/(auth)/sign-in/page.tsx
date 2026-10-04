import type { Metadata } from "next";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

const ERROR_MESSAGES: Record<string, string> = {
  link_invalid: "That link is invalid or has expired. Please request a new one.",
  oauth_failed: "We couldn't sign you in with that provider. Please try again.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  const errorMessage = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;
  const signUpHref = nextPath ? `/sign-up?next=${encodeURIComponent(nextPath)}` : "/sign-up";

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href={signUpHref} className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <SignInForm next={nextPath} />
      </div>
    </AuthCard>
  );
}
