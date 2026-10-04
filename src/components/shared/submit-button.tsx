import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/** A submit button that shows a spinner and disables itself while pending. */
export function SubmitButton({
  pending,
  children,
  disabled,
  ...props
}: ComponentProps<typeof Button> & { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}
