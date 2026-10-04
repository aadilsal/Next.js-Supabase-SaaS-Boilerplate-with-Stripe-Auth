import "server-only";

import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";
import { observabilityConfig, type LogLevel } from "@/config/observability";
import { isSupabaseConfigured } from "@/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Structured server logger.
 *
 *   logger.info("team.created", { userId, teamId });
 *   logger.error("stripe.webhook_failed", { error, eventId });
 *
 * Every entry is printed as one JSON line (easy to search in Vercel/Datadog/etc).
 * - `error` level is also sent to Sentry.
 * - Entries at or above `databaseLogLevel` are stored in `app_logs` (/admin/logs).
 * Event names use "area.what_happened" in snake_case.
 */

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LogContext {
  error?: unknown;
  userId?: string | null;
  teamId?: string | null;
  message?: string;
  [key: string]: unknown;
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return { name: error.name, message: error.message, stack: error.stack, code: typeof code === "string" ? code : undefined };
  }
  if (error && typeof error === "object" && "message" in error) {
    const { message, code } = error as { message: unknown; code?: unknown };
    return { name: "Error", message: String(message), code: typeof code === "string" ? code : undefined };
  }
  return { name: "Error", message: String(error) };
}

function write(level: LogLevel, event: string, context: LogContext = {}) {
  const { error, userId, teamId, message, ...rest } = context;
  const serialized = error === undefined ? undefined : serializeError(error);
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(message ? { message } : {}),
    ...(userId ? { userId } : {}),
    ...(teamId ? { teamId } : {}),
    ...rest,
    ...(serialized ? { error: serialized } : {}),
  };

  if (LEVELS[level] >= LEVELS[observabilityConfig.consoleLogLevel]) {
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }

  if (level === "error") {
    Sentry.captureException(error ?? new Error(message ?? event), {
      tags: { event },
      user: userId ? { id: userId } : undefined,
      extra: { teamId, ...rest },
    });
  } else {
    Sentry.addBreadcrumb({ category: event, level: level === "warn" ? "warning" : level, message, data: rest });
  }

  // Store in app_logs only once the database is configured (not during a first build).
  const canPersist = isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (canPersist && LEVELS[level] >= LEVELS[observabilityConfig.databaseLogLevel]) {
    const persist = () =>
      saveToDatabase({ level, event, message, userId, teamId, context: rest, error: serialized });
    try {
      // Write after the response is sent so logging never slows a request down.
      after(persist);
    } catch {
      // Outside a request (scripts, tests): write immediately.
      void persist();
    }
  }
}

async function saveToDatabase(row: {
  level: LogLevel;
  event: string;
  message?: string;
  userId?: string | null;
  teamId?: string | null;
  context: Record<string, unknown>;
  error?: SerializedError;
}) {
  try {
    // Service role: app_logs is not readable or writable by users.
    const { error } = await createAdminClient()
      .from("app_logs")
      .insert({
        level: row.level,
        event: row.event,
        message: row.message ?? null,
        user_id: row.userId ?? null,
        team_id: row.teamId ?? null,
        context: JSON.parse(JSON.stringify(row.context)),
        error: row.error ? JSON.parse(JSON.stringify(row.error)) : null,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
      });
    if (error) throw error;
  } catch (persistError) {
    // Never log through `logger` here, or a database outage would loop forever.
    console.error(
      JSON.stringify({ level: "error", event: "logger.persist_failed", error: serializeError(persistError) }),
    );
  }
}

export const logger = {
  debug: (event: string, context?: LogContext) => write("debug", event, context),
  info: (event: string, context?: LogContext) => write("info", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
  error: (event: string, context?: LogContext) => write("error", event, context),
};
