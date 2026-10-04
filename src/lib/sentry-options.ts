import { observabilityConfig } from "@/config/observability";

/**
 * Sentry options shared by the server, edge and browser SDKs.
 * Sentry stays OFF until NEXT_PUBLIC_SENTRY_DSN is set.
 */
export function sentryOptions() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: observabilityConfig.sentry.tracesSampleRate,
    // Don't send IP addresses, cookies or request bodies by default.
    sendDefaultPii: false,
  };
}
