"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

/** Last-resort error page, used when the root layout itself fails. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred.
          {error.digest && <span className="mt-2 block font-mono text-xs">Reference: {error.digest}</span>}
        </p>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}
