# Architecture

This document is the full technical design of the boilerplate. For the short list of rules that must never be broken, read [architecture-essentials.md](./architecture-essentials.md) first.

> **Design goal:** A stranger who bought this on Gumroad should be able to open any folder and understand what it does within a minute. When we must choose between clever and obvious, we choose obvious.

---

## 1. System overview

```
                         ┌──────────────────────────────────────────┐
   Browser ─────────────▶│  Next.js (App Router) on Vercel          │
                         │                                          │
                         │  proxy.ts ─ refreshes Supabase session    │
                         │  Server Components ─ read data (RLS)     │
                         │  Server Actions ─ mutations (RLS)        │
                         │  Route Handlers ─ webhooks & callbacks   │
                         └──────┬──────────────┬──────────────┬─────┘
                                │              │              │
                     anon key + │   secret key │      API key │
                     user JWT   │              │              │
                                ▼              ▼              ▼
                        ┌──────────────┐ ┌───────────┐ ┌────────────┐
                        │  Supabase    │ │  Stripe   │ │  Resend    │
                        │  Auth        │ │  Checkout │ │  (email)   │
                        │  Postgres+RLS│ │  Portal   │ └────────────┘
                        └──────▲───────┘ └─────┬─────┘
                               │ service role  │ signed webhook
                               └── /api/webhooks/stripe ◀┘
```

| Concern | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router), React Server Components | TypeScript `strict` everywhere |
| Styling | Tailwind CSS v4, shadcn/ui | Theme tokens in `globals.css`, see [design.md](./design.md) |
| Auth | Supabase Auth via `@supabase/ssr` | Cookie-based sessions |
| Database | Supabase Postgres | RLS on **every** table in `public` |
| Payments | Stripe Checkout + Customer Portal + webhooks | Hosted pages, so no card data touches our servers |
| Email | Resend + React Email | Auth emails are sent by Supabase through Resend SMTP |
| Validation | Zod | Env vars, form input and webhook payloads |
| Forms | react-hook-form + Zod resolver | Shared schema on client and server |
| Testing | Vitest, Playwright, Supabase DB tests | See §11 |
| Package manager | pnpm | |
| Hosting | Vercel + Supabase Cloud | Any Node host works |

---

## 2. Repository layout

```
.
├── docs/                         # Product & engineering docs (this folder)
├── supabase/
│   ├── config.toml               # Local Supabase config (auth providers, email templates)
│   ├── migrations/               # Timestamped SQL migrations — the only way the schema changes
│   ├── templates/                # Supabase Auth email HTML (confirm, magic link, reset)
│   ├── tests/                    # Database / RLS tests
│   └── seed.sql                  # Local demo data
├── emails/                       # React Email templates sent by the app (welcome, invite)
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Public pages: landing, pricing, legal
│   │   ├── (auth)/               # sign-in, sign-up, forgot/reset-password, invite/[token]
│   │   ├── auth/                 # callback/ and confirm/ route handlers
│   │   ├── (app)/
│   │   │   ├── dashboard/[teamSlug]/      # Team-scoped app (home, members, billing, settings)
│   │   │   └── account/                   # Personal profile & security
│   │   ├── admin/                # Platform admin panel (platform admins only)
│   │   └── api/webhooks/stripe/  # Stripe webhook route handler
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (generated — edit sparingly)
│   │   └── shared/               # App-wide composed components (AppShell, PageHeader, EmptyState…)
│   ├── features/                 # One folder per domain — the heart of the codebase
│   │   ├── auth/
│   │   ├── teams/
│   │   ├── billing/
│   │   ├── account/
│   │   ├── admin/
│   │   └── email/
│   ├── lib/
│   │   ├── supabase/             # server.ts, client.ts, admin.ts, proxy.ts
│   │   ├── stripe.ts             # Stripe SDK singleton
│   │   ├── safe-action.ts        # Server Action wrapper (auth + validation + error shape)
│   │   └── utils.ts
│   ├── config/                   # Everything a buyer customizes, with no logic
│   │   ├── site.ts               # Product name, URLs, support email, brand color for emails
│   │   ├── features.ts           # On/off switches: auth methods, teams, billing, admin, marketing…
│   │   ├── billing.ts            # Plans, entitlements, limits, Stripe price IDs
│   │   ├── marketing.ts          # Landing page copy: hero, features, FAQ, CTA, links
│   │   └── navigation.ts         # Sidebar items
│   ├── types/database.ts         # Generated by `supabase gen types` — never hand-edit
│   ├── env.ts                    # Zod-validated environment variables
│   └── proxy.ts                  # Session refresh + route protection (middleware)
├── tests/e2e/                    # Playwright specs
├── .env.example
└── package.json
```

### Feature module convention

Every folder in `src/features/<domain>/` has the same shape, so a buyer who learns one has learned them all:

| File | Purpose | Runs on |
|---|---|---|
| `schemas.ts` | Zod schemas for input; exported types are inferred from them | both |
| `queries.ts` | Read functions called from Server Components | server (`import "server-only"`) |
| `actions.ts` | Server Actions (`"use server"`), the only way the UI mutates data | server |
| `components/` | React components specific to this domain | both |
| `lib/` *(optional)* | Pure helpers with no I/O, which are easy to unit test | both |

Rules:
- Features may import from `lib/`, `config/`, `components/` and **other features' `queries.ts`/`schemas.ts`**. They never import another feature's `actions.ts` internals or components that reach into its data.
- `app/` route files stay thin. They call `queries`, render feature components and handle `notFound()`/`redirect()`.

---

## 3. Supabase clients

There are exactly three ways to talk to Supabase. Picking the wrong one is the most common security bug in Supabase apps, so each lives in its own file:

| File | Key used | RLS | Use for |
|---|---|---|---|
| `lib/supabase/client.ts` | anon / publishable key | ✅ enforced | Client Components (rare: realtime, auth UI) |
| `lib/supabase/server.ts` | anon / publishable key + user cookie | ✅ enforced | **Default.** Server Components, Server Actions, Route Handlers |
| `lib/supabase/admin.ts` | service role / secret key | ❌ **bypassed** | Stripe webhooks, admin panel, system jobs only |

`admin.ts` starts with `import "server-only"` so the build fails if it ever ends up in a client bundle.

---

## 4. Authentication

Supabase Auth handles identities. We support three sign-in methods plus password recovery.

| Flow | Client call | Return route | Server step |
|---|---|---|---|
| Email + password sign-up | `auth.signUp()` (email confirmation on) | `/auth/confirm?token_hash=…&type=signup` | `auth.verifyOtp()` → redirect to dashboard |
| Email + password sign-in | `auth.signInWithPassword()` | n/a | n/a |
| Google OAuth | `auth.signInWithOAuth({ provider: 'google' })` | `/auth/callback?code=…` | `auth.exchangeCodeForSession()` |
| Magic link | `auth.signInWithOtp({ email })` | `/auth/confirm?token_hash=…&type=magiclink` | `auth.verifyOtp()` |
| Password reset | `auth.resetPasswordForEmail()` | `/auth/confirm?…&type=recovery` → `/reset-password` | `auth.updateUser({ password })` |

**Session handling**
- `src/proxy.ts` runs on every non-static request. It refreshes the Supabase session cookie and redirects signed-out users away from `/dashboard`, `/account`, `/admin` and `/invite`. (In older Next.js versions this file is called `middleware.ts`.)
- The proxy is a **convenience redirect, not a security boundary.** Every protected page and Server Action re-checks the user itself.
- To decide what a user may do, server code calls `supabase.auth.getUser()` (or `getClaims()`), which verifies the JWT. It **never** trusts `getSession()` on the server, because that only reads the cookie without verifying it.
- All `next` / `redirectTo` query parameters are checked against a same-origin allowlist to prevent open redirects.

**On sign-up** a Postgres trigger (`handle_new_user`) on `auth.users` runs in the same transaction and creates:
1. a `profiles` row
2. a personal team (`teams.is_personal = true`)
3. an `owner` membership for that team

This means every authenticated user always has at least one team, so the app never has to handle a "no team" state.

---

## 5. Multi-tenancy (teams)

**Model:** Users belong to one or more **teams**. The team is the **tenant boundary**: data, billing and permissions are all scoped to a team. The active team is the `[teamSlug]` segment in the URL, so links can be shared and opening several tabs on different teams just works.

**Roles** (`team_role` enum):

| Capability | owner | admin | member |
|---|:-:|:-:|:-:|
| View team data | ✅ | ✅ | ✅ |
| Edit team name / slug | ✅ | ✅ | |
| Invite & remove members | ✅ | ✅ | |
| Change member roles | ✅ | ✅ *(not owners)* | |
| Manage billing | ✅ | | |
| Delete team / transfer ownership | ✅ | | |

Roles are checked **twice**: in the Server Action (to return a friendly error) and in RLS (as the real enforcement). A team must always have at least one owner. This is enforced by a trigger, not only in application code.

**Invitations**
1. An owner or admin submits an email and role. The `invite` action inserts an `invitations` row with a random token, storing only its SHA-256 hash, and an expiry of 7 days.
2. The app emails a link to `/invite/<token>` using the React Email `TeamInvite` template.
3. The invitee signs in or signs up, then calls the `accept_invitation(token)` Postgres function (`security definer`). It hashes the token, checks expiry and that the email matches the signed-in user, inserts the membership and marks the invitation as accepted, all in one transaction.

---

## 6. Database schema

All tables live in the `public` schema, have RLS enabled and have `created_at timestamptz default now()`. Migrations in `supabase/migrations/` are the only source of truth for the schema.

```
auth.users ─1:1─ profiles
                    │
                    └─< team_members >─ teams ─┬─< invitations
                                                ├── billing_customers (1:1)
                                                ├─< subscriptions
                                                └─< purchases
stripe_events (standalone, webhook idempotency)
```

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `full_name`, `avatar_url`, `is_platform_admin` | Users can update their own name and avatar. `is_platform_admin` is **not** in the column-level `UPDATE` grant |
| `teams` | `id`, `name`, `slug` (unique), `is_personal` | |
| `team_members` | `team_id`, `user_id`, `role` | PK `(team_id, user_id)` |
| `invitations` | `id`, `team_id`, `email` (citext), `role`, `token_hash`, `invited_by`, `expires_at`, `accepted_at` | Unique on open `(team_id, email)` |
| `billing_customers` | `team_id` (PK), `stripe_customer_id` (unique) | |
| `subscriptions` | `id` (Stripe sub ID), `team_id`, `status`, `price_id`, `interval`, `current_period_end`, `cancel_at_period_end` | Written by the webhook only |
| `purchases` | `id` (Stripe Checkout Session ID), `team_id`, `price_id`, `amount_total`, `currency`, `status` | One-time / lifetime payments. Written by the webhook only |
| `stripe_events` | `id` (Stripe event ID), `type`, `processed_at` | No RLS policies, so only the service role can access it |

### RLS pattern

Two `security definer` helper functions (with `search_path` locked to `''`) keep policies short and avoid recursive RLS on `team_members`:

```sql
public.is_team_member(team_id uuid) returns boolean
public.has_team_role(team_id uuid, roles public.team_role[]) returns boolean
```

| Table | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| `profiles` | own row; teammates' rows (name/avatar for member lists) | UPDATE own row (allowed columns only) |
| `teams` | `is_team_member(id)` | INSERT any authenticated user (trigger adds them as owner); UPDATE `owner`/`admin`; DELETE `owner` |
| `team_members` | `is_team_member(team_id)` | `owner`/`admin` (plus role rules from §5); members can DELETE their own row (leave team) |
| `invitations` | `owner`/`admin` of the team | `owner`/`admin`; acceptance only through `accept_invitation()` |
| `billing_customers`, `subscriptions`, `purchases` | `is_team_member(team_id)` | **none**: written by the service role from the webhook |
| `stripe_events` | none | none |

Every policy that has to pass is covered by a test in `supabase/tests/`, and so is every policy that has to fail (see §11).

---

## 7. Billing (Stripe)

**Billing belongs to the team, not the user.** Each team gets at most one Stripe Customer, created lazily the first time someone opens checkout.

### Plan configuration

`src/config/billing.ts` is the single file a buyer edits to change pricing:

```ts
export const plans = [
  { id: "free", name: "Free", features: [...], prices: [] },
  {
    id: "pro",
    name: "Pro",
    features: [...],
    prices: [
      { interval: "month", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY, amount: 19 },
      { interval: "year",  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,  amount: 190 },
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    features: [...],
    prices: [{ interval: "one_time", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME, amount: 299 }],
  },
];
```

Stripe is the source of truth for **prices and payment state**. `billing.ts` is the source of truth for **what each plan unlocks**.

### Flows

| Flow | Implementation |
|---|---|
| Checkout | `createCheckoutSession` Server Action (owner only). It validates `priceId` against `billing.ts` and uses `mode: "subscription"` or `mode: "payment"`. `client_reference_id` is set to the team ID and `metadata.team_id` is set too. The action redirects to Stripe-hosted Checkout |
| Customer portal | `createPortalSession` Server Action (owner only), which redirects to the Stripe Billing Portal |
| Entitlements | `getTeamEntitlements(teamId)` in `features/billing/queries.ts` resolves the plan in this order: an active or trialing subscription, then a paid lifetime purchase, then `free`. UI and actions gate features with `hasEntitlement(entitlements, "feature-key")`, or the `<UpgradeGate>` Server Component. Plan `limits.members` is enforced when inviting |

### Webhook: `POST /api/webhooks/stripe`

1. Read the **raw body** (`await req.text()`) and verify it with `stripe.webhooks.constructEvent` and `STRIPE_WEBHOOK_SECRET`. Reject it with `400` if verification fails.
2. **Idempotency:** `insert into stripe_events (id)`. If the ID already exists, return `200` immediately.
3. Handle the event with the admin client:

| Event | Action |
|---|---|
| `checkout.session.completed` / `.async_payment_succeeded` | Link `stripe_customer_id` to the team. If `mode = payment` and paid, upsert `purchases`. If `mode = subscription`, fetch the subscription and upsert it |
| `customer.subscription.created` / `.updated` / `.deleted` / `.paused` / `.resumed` | Re-fetch and upsert `subscriptions` |
| `invoice.paid` / `invoice.payment_failed` | Re-sync the invoice's subscription (status becomes `active` / `past_due`) |
| `charge.refunded` | Full refund of a one-time payment sets the purchase to `refunded`, which removes lifetime access |

The list lives in `HANDLED_EVENTS` in `src/features/billing/webhooks/handlers.ts`. If a handler throws, the event row is deleted and a `500` is returned, so Stripe's automatic retry is processed rather than skipped as a duplicate.

4. Return `200`. Unknown event types also return `200`, so Stripe stops retrying them.

Handlers **re-fetch** the object from the Stripe API before writing (instead of trusting the event payload order). Stripe can deliver events out of order, so handlers must not assume a sequence.

---

## 8. Transactional email

| Email | Sent by | Template location |
|---|---|---|
| Confirm sign-up | Supabase Auth (through Resend SMTP) | `supabase/templates/confirm.html` |
| Magic link | Supabase Auth | `supabase/templates/magic-link.html` |
| Password reset | Supabase Auth | `supabase/templates/recovery.html` |
| Welcome | App, after first confirmed sign-in | `emails/welcome.tsx` |
| Team invitation | App, in the `inviteMember` action | `emails/team-invite.tsx` |
`features/email/send.ts` is a thin `sendEmail({ to, subject, react })` wrapper around Resend, plus one helper per email (`sendWelcomeEmail`, `sendTeamInviteEmail`). Swapping providers means rewriting this one function. Without `RESEND_API_KEY`, emails are logged to the console so every flow works before email is set up. Invitations also return a copyable link to the inviter. Run `pnpm email:dev` to preview every template in the browser.

Auth emails stay in Supabase because Supabase generates the secure tokens. The Supabase templates use the same colors and logo as the React Email templates, so all emails look consistent.

---

## 9. Platform admin panel (`/admin`)

- Access requires `profiles.is_platform_admin = true`. Users can't set this flag themselves. Grant it with SQL or `pnpm admin:grant <email>`.
- `admin/layout.tsx` checks the flag on the server and calls `notFound()` for everyone else, so the route's existence is not revealed.
- Admin queries use the **admin client** (they need to see across tenants). Every admin query function calls `requirePlatformAdmin()` first, never only the layout.
- MVP scope: list and search users and teams, see a team's plan and members, impersonate nothing (out of scope), and ban or unban a user through the Supabase Admin API.

---

## 10. Server Actions & error handling

All Server Actions go through one wrapper in `lib/safe-action.ts`:

```ts
export const inviteMember = teamAction(           // requires auth + team membership
  inviteMemberSchema,                              // Zod input schema
  { roles: ["owner", "admin"] },                   // optional role gate
  async ({ input, user, team, supabase }) => { ... }
);
```

The wrapper:
1. Parses the input with the schema. If parsing fails, it returns `{ ok: false, error, fieldErrors }`.
2. Gets the user with `getUser()` (`authAction` / `teamAction`; `publicAction` skips this).
3. For team actions, loads the membership and checks the role.
4. Runs the handler and returns `{ ok: true, data }`, or `{ ok: false, error }` for expected failures (thrown as `ActionError`). Known database errors (e.g. `TEAM_NEEDS_AN_OWNER`) are mapped to friendly messages by `toActionError()`.
5. Logs unexpected errors on the server and returns a generic message. Stack traces and database errors never reach the client.

Pages use `error.tsx` and `not-found.tsx` boundaries. A missing team or a team the user isn't part of returns a 404, never a 403, so team slugs can't be enumerated.

---

## 11. Testing strategy

| Layer | Tool | What's covered |
|---|---|---|
| Unit | Vitest | `features/*/lib`, entitlement resolution, Zod schemas, redirect allowlist |
| Database / RLS | Supabase test DB (pgTAP via `supabase test db`) | For each table: members can read their team and outsiders can't. Role-gated writes. Users can't change `is_platform_admin`. `accept_invitation` covering expired, wrong-email and reused tokens |
| Webhook | Vitest + Stripe fixture events | Signature rejection, idempotency, each handled event type |
| E2E | Playwright | Sign up → dashboard; invite → accept; checkout (Stripe test mode) → plan shows Pro; admin route is 404 for non-admins |

CI (GitHub Actions) runs `typecheck`, `lint`, `test`, `supabase test db` and the Playwright smoke suite on every PR.

---

## 12. Configuration & environment

`src/env.ts` validates every variable with Zod at boot, so a missing key fails loudly with a clear message instead of a vague runtime error.

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Absolute URLs for redirects and emails |
| `NEXT_PUBLIC_SUPABASE_URL` | public | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon or publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Service role or secret key. Used only by `lib/supabase/admin.ts` |
| `STRIPE_SECRET_KEY` | **server only** | |
| `STRIPE_WEBHOOK_SECRET` | **server only** | |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` / `_YEARLY` / `NEXT_PUBLIC_STRIPE_PRICE_LIFETIME` | public | Referenced from `config/billing.ts`. Price IDs are not secret, and the pricing table needs them in the browser |
| `RESEND_API_KEY` | **server only** | |
| `EMAIL_FROM` | server | e.g. `Acme <hello@acme.com>` |

Google OAuth credentials go in the Supabase dashboard (and in `supabase/config.toml` for local development), not in the Next.js env.

---

## 13. Local development & deployment

**Local**
```bash
pnpm install
supabase start                 # Postgres, Auth, Inbucket (local email inbox) in Docker
pnpm db:reset                  # apply migrations + seed
pnpm db:types                  # regenerate src/types/database.ts
stripe listen --forward-to localhost:3000/api/webhooks/stripe
pnpm dev
```

**Production**
1. Create a Supabase project and run `supabase link` then `supabase db push`.
2. In Supabase, configure the Google provider, the custom SMTP (Resend), the auth email templates and the redirect URLs.
3. Create the Stripe products and prices, turn on the Customer Portal and add a webhook endpoint for the events in §7.
4. Deploy to Vercel with the env vars from §12.

---

## 14. Key decisions

| Decision | Alternatives considered | Why |
|---|---|---|
| Team is the tenant and the billing entity | Per-user billing | The PRD targets B2B. Per-user billing is just a personal team with one member |
| Team slug in URL | Active team in a cookie | Shareable links, works with multiple tabs, easier to reason about |
| RLS as the authorization boundary | App-layer checks only | One bug in app code can't leak cross-tenant data |
| Server Actions for mutations | REST/tRPC API layer | Less code for buyers to read. Route handlers only where an external caller needs a URL |
| Stripe-hosted Checkout & Portal | Embedded Elements | No PCI scope, less code, supports every pricing model |
| Plans in `config/billing.ts` | Syncing products into the DB | One file to edit, readable, no sync job |
| Supabase sends auth emails; Resend sends app emails | Routing all mail through a Send Email Hook | Fewer moving parts for buyers to set up |
| No ORM | Drizzle / Prisma | Supabase client + generated types fit RLS naturally and mean one less tool to learn |
