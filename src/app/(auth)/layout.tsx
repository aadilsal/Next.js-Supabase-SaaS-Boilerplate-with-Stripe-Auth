import { Logo } from "@/components/shared/logo";

/** Centered card layout for sign-in, sign-up, password reset and invitations. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-muted/40 px-4 py-12">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
