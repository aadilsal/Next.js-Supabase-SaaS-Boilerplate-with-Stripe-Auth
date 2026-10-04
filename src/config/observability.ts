/**
 * Logging, error tracking and audit settings.
 *
 * - Sentry turns on when NEXT_PUBLIC_SENTRY_DSN is set (see .env.example).
 * - The logger (src/lib/logger.ts) prints JSON lines and stores warnings and
 *   errors in the `app_logs` table (viewable at /admin/logs).
 * - Audit events (who did what) go to the `audit_logs` table.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export const observabilityConfig = {
  sentry: {
    /** Share of requests traced for performance/latency monitoring (0–1). */
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    /**
     * Session Replay records user sessions in the browser. Off by default for
     * privacy and bundle size. When on, replays are captured for sessions with errors.
     */
    sessionReplay: false,
  },

  /** Lowest level printed to the server console. */
  consoleLogLevel: (process.env.NODE_ENV === "production" ? "info" : "debug") as LogLevel,
  /** Lowest level stored in the `app_logs` table. "warn" keeps the table small. */
  databaseLogLevel: "warn" as LogLevel,

  /** Record security and business events in `audit_logs`. */
  auditLog: true,

  /**
   * Retention, applied by `select public.purge_old_logs(auditLogDays, appLogDays)`.
   * Schedule it with pg_cron (see docs/architecture.md §15).
   */
  retention: { auditLogDays: 365, appLogDays: 30 },
};
