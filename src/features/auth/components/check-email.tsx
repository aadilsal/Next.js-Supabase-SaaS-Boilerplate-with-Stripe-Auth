"use client";

import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const RESEND_COOLDOWN_SECONDS = 60;

/** "Check your inbox" state shown after sending a sign-up or sign-in email. */
export function CheckEmail({
  email,
  message,
  onResend,
  onBack,
}: {
  email: string;
  message: string;
  onResend?: () => void;
  onBack?: () => void;
}) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <div className="flex flex-col items-center gap-4 text-center" role="status">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="size-6 text-primary" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          {message} <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      <div className="flex gap-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            Use a different email
          </Button>
        )}
        {onResend && (
          <Button
            variant="outline"
            size="sm"
            disabled={cooldown > 0}
            onClick={() => {
              onResend();
              setCooldown(RESEND_COOLDOWN_SECONDS);
            }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </Button>
        )}
      </div>
    </div>
  );
}
