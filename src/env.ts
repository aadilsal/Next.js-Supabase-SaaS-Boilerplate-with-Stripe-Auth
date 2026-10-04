import { z } from "zod";

/**
 * Environment variables, validated with Zod.
 *
 * - `publicEnv()` is safe everywhere (values are inlined into the browser bundle).
 * - `serverEnv()` holds secrets and throws if it is ever called in the browser.
 *
 * Both are lazy: a missing variable fails with a clear message the first time
 * it is needed, instead of crashing pages that don't use it.
 *
 * Adding a variable? Add it here AND to .env.example.
 */

// Treat empty strings in .env files as "not set".
const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Sentry DSNs are public by design. Leave empty to keep Sentry off.
  NEXT_PUBLIC_SENTRY_DSN: optionalString,
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Billing and email are optional so you can run the app before setting them up.
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: z.string().min(1).default("Acme <onboarding@resend.dev>"),
  // Build-time only (read by next.config.ts) to upload source maps to Sentry. Optional.
  SENTRY_ORG: optionalString,
  SENTRY_PROJECT: optionalString,
  SENTRY_AUTH_TOKEN: optionalString,
});

function parse<T extends z.ZodType>(schema: T, values: Record<string, unknown>): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing environment variables:\n${problems}\n` +
        `Copy .env.example to .env.local and fill in the values. See docs/getting-started.md.`,
    );
  }
  return result.data;
}

let cachedPublic: z.infer<typeof publicSchema> | undefined;
let cachedServer: z.infer<typeof serverSchema> | undefined;

export function publicEnv() {
  // NEXT_PUBLIC_* variables must be referenced literally so Next.js can inline them.
  cachedPublic ??= parse(publicSchema, {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
  return cachedPublic;
}

export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called in the browser. Secrets must stay on the server.");
  }
  cachedServer ??= parse(serverSchema, {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  });
  return cachedServer;
}
