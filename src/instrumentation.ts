import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry-options";

/**
 * Runs once when a server instance starts (Node.js and Edge runtimes).
 * See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md
 */
export function register() {
  Sentry.init(sentryOptions());
}

/** Reports errors thrown in Server Components, Route Handlers and Server Actions. */
export const onRequestError = Sentry.captureRequestError;
