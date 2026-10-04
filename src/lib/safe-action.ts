import "server-only";

import type { PostgrestError, User } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import { logger } from "@/lib/logger";
import { createClient, type ServerClient } from "@/lib/supabase/server";
import type { Team, TeamRole } from "@/types/database";

export type { ActionResult };

/**
 * Throw this for EXPECTED failures. Its message is shown to the user as-is.
 * Any other error is logged and replaced with a generic message, so stack
 * traces and database details never reach the browser.
 */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

/** Friendly messages for errors raised by our Postgres functions and triggers. */
const DATABASE_ERRORS: Record<string, string> = {
  TEAM_NEEDS_AN_OWNER: "A team needs at least one owner. Make someone else an owner first.",
  ONLY_OWNER_CAN_MANAGE_OWNERS: "Only owners can change or remove other owners.",
  INVITATION_NOT_FOUND: "This invitation link is invalid.",
  INVITATION_ALREADY_USED: "This invitation has already been used.",
  INVITATION_EXPIRED: "This invitation has expired. Ask for a new one.",
  INVITATION_EMAIL_MISMATCH:
    "This invitation was sent to a different email address. Sign in with that address to accept it.",
  UNAUTHENTICATED: "Please sign in again.",
};

/** Convert a Supabase/Postgres error into an ActionError with a friendly message. */
export function toActionError(
  error: PostgrestError | { message: string; code?: string },
  messages: { uniqueViolation?: string } = {},
): ActionError {
  const known = Object.keys(DATABASE_ERRORS).find((key) => error.message.includes(key));
  if (known) return new ActionError(DATABASE_ERRORS[known]);
  if (error.code === "23505") {
    return new ActionError(messages.uniqueViolation ?? "That already exists.");
  }
  logger.error("action.database_error", { error });
  return new ActionError("Something went wrong. Please try again.");
}

type Schema = z.ZodType;

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    // Let Next.js handle redirect() and notFound().
    unstable_rethrow(error);
    if (error instanceof ActionError) return { ok: false, error: error.message };
    logger.error("action.unexpected_error", { error });
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

function parseInput<S extends Schema>(
  schema: S,
  raw: unknown,
): { ok: true; input: z.output<S> } | { ok: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return { ok: true, input: parsed.data };
  return {
    ok: false,
    result: {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    },
  };
}

interface PublicContext<I> {
  input: I;
  supabase: ServerClient;
}
interface AuthContext<I> extends PublicContext<I> {
  user: User;
}
interface TeamContext<I> extends AuthContext<I> {
  team: Team;
  role: TeamRole;
}

/** An action anyone can call (sign in, sign up, ...). Input is still validated. */
export function publicAction<S extends Schema, T>(
  schema: S,
  handler: (ctx: PublicContext<z.output<S>>) => Promise<T>,
) {
  return async (raw: z.input<S>): Promise<ActionResult<T>> => {
    const parsed = parseInput(schema, raw);
    if (!parsed.ok) return parsed.result;
    return run(async () => handler({ input: parsed.input, supabase: await createClient() }));
  };
}

/** An action that requires a signed-in user. */
export function authAction<S extends Schema, T>(
  schema: S,
  handler: (ctx: AuthContext<z.output<S>>) => Promise<T>,
) {
  return async (raw: z.input<S>): Promise<ActionResult<T>> => {
    const parsed = parseInput(schema, raw);
    if (!parsed.ok) return parsed.result;

    return run(async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new ActionError("Please sign in again.");
      return handler({ input: parsed.input, supabase, user });
    });
  };
}

/**
 * An action scoped to one team. The input must contain `teamSlug`.
 *
 * The team is loaded through RLS, so a user can only act on teams they belong
 * to. `roles` gives a friendly error early; RLS still enforces it in Postgres.
 */
export function teamAction<S extends z.ZodType<{ teamSlug: string }>, T>(
  schema: S,
  options: { roles?: TeamRole[] },
  handler: (ctx: TeamContext<z.output<S>>) => Promise<T>,
) {
  return authAction(schema, async (ctx) => {
    const { data: membership } = await ctx.supabase
      .from("team_members")
      .select("role, team:teams!inner(*)")
      .eq("user_id", ctx.user.id)
      .eq("team.slug", ctx.input.teamSlug)
      .maybeSingle();

    if (!membership?.team) throw new ActionError("Team not found.");
    if (options.roles && !options.roles.includes(membership.role)) {
      throw new ActionError("You don't have permission to do that.");
    }
    return handler({ ...ctx, team: membership.team, role: membership.role });
  });
}
