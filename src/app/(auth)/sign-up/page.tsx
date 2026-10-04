import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  const signInHref = nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in";

  return (
    <AuthCard
      title="Create your account"
      description="Get started in less than a minute"
      footer={
        <div className="space-y-2">
          <p>
            Already have an account?{" "}
            <Link href={signInHref} className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
          <p className="text-xs">
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      }
    >
      <SignUpForm next={nextPath} />
    </AuthCard>
  );
}
