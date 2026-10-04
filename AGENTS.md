<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Instructions for AI coding agents working in this repository. Human contributors should follow them too.

## What this repo is

A **commercial Next.js + Supabase + Stripe SaaS boilerplate**, sold on Gumroad to developers who will read, copy and change every file. Code quality *is* the product, so readability beats cleverness every time.

- Product requirements: [docs/PRD.md](docs/PRD.md)
- **Must-read rules:** [docs/architecture-essentials.md](docs/architecture-essentials.md)
- Full design: [docs/architecture.md](docs/architecture.md) · UI: [docs/design.md](docs/design.md)

## Stack

Next.js (App Router, RSC, Server Actions) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Supabase (Auth + Postgres + RLS) via `@supabase/ssr` · Stripe (Checkout, Portal, webhooks) · Resend + React Email · Zod · react-hook-form · Vitest · Playwright · pnpm

## Commands

```bash
pnpm dev              # start Next.js
pnpm build            # production build
pnpm typecheck        # next typegen && tsc --noEmit
pnpm lint             # eslint
pnpm test             # vitest (unit + webhook route)
pnpm test:e2e         # playwright (needs local Supabase + .env.local)
pnpm db:start         # local Supabase in Docker (prints keys for .env.local)
pnpm db:reset         # re-apply migrations + seed
pnpm db:types         # regenerate src/types/database.ts
pnpm db:test          # pgTAP RLS tests in supabase/tests
pnpm email:dev        # preview React Email templates on :3001
pnpm stripe:listen    # forward Stripe webhooks to localhost
pnpm admin:grant <email>   # make a user a platform admin
```

Before you say a task is done, run `pnpm typecheck && pnpm lint && pnpm test`. If you touched SQL, also run `pnpm db:test`.

## Where code goes

- `src/features/<domain>/`: `schemas.ts` (Zod) · `queries.ts` (reads, server-only) · `actions.ts` (Server Actions) · `components/` · `lib/` (pure helpers)
- `src/app/`: thin route files only. They call queries, render feature components and handle redirect/notFound
- `src/components/ui/`: generated shadcn primitives. Add them with `pnpm dlx shadcn@latest add <name>` and avoid hand-editing
- `src/components/shared/`: app-wide compositions (AppShell, PageHeader, TextField, ConfirmDialog…)
- `src/hooks/use-action.ts`: call Server Actions from Client Components (pending state, toasts, field errors)
- `src/config/`: `site.ts`, `features.ts`, `billing.ts`, `marketing.ts`, `navigation.ts`. Everything a buyer configures, with no logic
- `emails/`: React Email templates (import config with relative paths, not `@/`)
- `supabase/migrations/`: the only way the schema changes

## Hard rules (do not break)

1. **RLS on every table.** A new table means one migration with `enable row level security`, policies and pgTAP tests (allow + deny) in `supabase/tests/`.
2. **Use the right Supabase client.** Use `lib/supabase/server.ts` by default. Use `lib/supabase/admin.ts` (service role) **only** in the Stripe webhook, `/admin` and system jobs, with a comment justifying it.
3. **Authorize on the server with `auth.getUser()` / `getClaims()`**, never `getSession()`. The `proxy.ts` redirect is not a security check.
4. **Every Server Action goes through `lib/safe-action.ts`** (`publicAction` / `authAction` / `teamAction`) for auth, Zod validation, role checks and the `{ ok, data } | { ok, error }` shape. Throw `ActionError` for messages the user should see.
5. **Never take `team_id`, `role` or `priceId` from the client at face value.** Resolve the team from a verified membership. Validate the price against `config/billing.ts`.
6. **Stripe webhook:** raw body + signature verification, idempotency via `stripe_events`, re-fetch objects, no ordering assumptions. Grant access only from webhook-written data, never from the success URL.
7. **No secrets in `NEXT_PUBLIC_*`.** Add every new env var to `src/env.ts` **and** `.env.example`.
8. **Never edit a shipped migration** and never hand-edit `src/types/database.ts`.
9. **Semantic Tailwind tokens only** (`bg-primary`, `text-muted-foreground`), never raw palette colors. Rebranding must only need `config/` and `globals.css`.
10. Return **404, not 403**, for resources in teams the user doesn't belong to.

## Code style

- TypeScript strict. No `any`. Infer types from Zod (`z.infer`) and the generated `Database` type.
- Server Components by default. Add `"use client"` only for interactivity, as far down the component tree as possible.
- Files with server-only code start with `import "server-only"`.
- Name things for a stranger: `getTeamMembers`, not `fetchTM`. Comment *why*, not *what*.
- Every UI screen needs loading (`loading.tsx` / Skeleton), empty (`EmptyState`) and error states.
- Forms: react-hook-form + the feature's Zod schema. Show field errors inline and action results as a toast.
- Accessibility: labels on all inputs, `aria-label` on icon-only buttons. Don't remove focus styles.

## Working conventions

- Keep changes scoped to the task. Don't reformat or refactor unrelated files. Buyers diff our releases.
- If behavior described in `docs/` changes, update the doc in the same change.
- Don't add a dependency without a clear reason. Each one is something every buyer has to trust and maintain.
- Never commit `.env*` files other than `.env.example`, real keys or customer data.
- Ask before you add new infrastructure (queues, cron providers, analytics, ORMs). The stack is deliberately small.
