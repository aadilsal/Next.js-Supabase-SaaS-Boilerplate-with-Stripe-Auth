"use client";

import { CheckCircle2, Info, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { siteConfig } from "@/config/site";

const POLL_EVERY_MS = 2000;
const GIVE_UP_AFTER_MS = 30000;

/**
 * Shown after returning from Stripe Checkout. Access is granted by the webhook,
 * not by this redirect, so we refresh until the webhook has updated the plan.
 */
export function CheckoutStatus({ checkout, isUpgraded }: { checkout?: string; isUpgraded: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const startedAt = useRef(0);
  const [timedOut, setTimedOut] = useState(false);
  const waiting = checkout === "success" && !isUpgraded && !timedOut;

  useEffect(() => {
    if (!waiting) return;
    if (startedAt.current === 0) startedAt.current = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt.current > GIVE_UP_AFTER_MS) setTimedOut(true);
      else router.refresh();
    }, POLL_EVERY_MS);
    return () => clearInterval(timer);
  }, [waiting, router]);

  if (checkout === "canceled") {
    return (
      <Alert>
        <Info />
        <AlertTitle>Checkout canceled</AlertTitle>
        <AlertDescription>No charge was made. You can upgrade any time.</AlertDescription>
      </Alert>
    );
  }
  if (checkout !== "success") return null;

  if (isUpgraded) {
    return (
      <Alert>
        <CheckCircle2 className="text-success" />
        <AlertTitle>You&apos;re all set!</AlertTitle>
        <AlertDescription>
          Thanks for upgrading. Your new plan is active.{" "}
          <button className="underline" onClick={() => router.replace(pathname)}>
            Dismiss
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (timedOut) {
    return (
      <Alert>
        <Info />
        <AlertTitle>Payment received. Still finalizing.</AlertTitle>
        <AlertDescription>
          This is taking longer than usual. Refresh in a minute, or contact {siteConfig.supportEmail} if your
          plan doesn&apos;t update.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Loader2 className="animate-spin" />
      <AlertTitle>Finalizing your purchase…</AlertTitle>
      <AlertDescription>This usually takes a few seconds.</AlertDescription>
    </Alert>
  );
}
