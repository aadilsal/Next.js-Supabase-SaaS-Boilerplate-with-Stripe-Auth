# Architecture Essentials

The one-page version of [architecture.md](./architecture.md). If you only read one engineering doc, read this one. Every rule below exists because breaking it either leaks customer data or loses money.

---

## The mental model in 5 lines

1. **The team is the tenant.** Every piece of business data has a `team_id`. Billing belongs to the team.
2. **RLS is the security boundary.** The app layer checks permissions to show friendly errors. Postgres enforces them.
3. **Server Components read, Server Actions write.** Route Handlers exist only for external callers (the Stripe webhook and auth callbacks).
4. **Stripe owns payment state.** We store a copy that only the signed webhook writes. `config/billing.ts` owns what each plan unlocks.
5. **One domain = one folder** in `src/features/`, each with the same `schemas / queries / actions / components` shape.

---

## Non-negotiable rules

### Security
- [ ] **Every new table:** `enable row level security` + policies + tests for both access that should pass and access that should fail, all in the same migration PR.
- [ ] **Use `lib/supabase/server.ts` by default.** Only use `lib/supabase/admin.ts` (service role, bypasses RLS) in the Stripe webhook, the admin panel and system jobs, and each use must have a comment explaining why.
- [ ] **On the server, authorize with `auth.getUser()` / `getClaims()`, never `getSession()`.**
- [ ] **`proxy.ts` is not security.** Every protected page, action and handler re-checks the user.
- [ ] **No secrets in `NEXT_PUBLIC_*`.** The service role key, Stripe secret, webhook secret and Resend key are server-only and validated in `src/env.ts`.
- [ ] **Never trust client input for identity or price.** `team_id` comes from a verified membership, never from a hidden form field. `priceId` must exist in `config/billing.ts`.
- [ ] **Check every redirect target** (`next`, `redirectTo`) against the same-origin allowlist.
- [ ] **Return 404, not 403,** for teams the user isn't a member of.
- [ ] Store invitation tokens **hashed**. Make them single-use and expire them after 7 days.
- [ ] Users can never set `profiles.is_platform_admin` themselves (it's excluded from the column `UPDATE` grant).

### Billing
- [ ] Verify the webhook signature using the **raw body**. Reject unsigned requests with `400`.
- [ ] Make every webhook idempotent by inserting the event ID into `stripe_events` first.
- [ ] Don't assume events arrive in order. Re-fetch the object from Stripe before writing.
- [ ] Never grant access from the Checkout **success redirect**. Grant it only after the webhook has written the subscription or purchase.
- [ ] Only the team **owner** can start checkout or open the billing portal.

### Data
- [ ] Change the schema **only** through a new file in `supabase/migrations/`. Never edit a migration that has shipped.
- [ ] Run `pnpm db:types` after every migration. `src/types/database.ts` is generated, so never hand-edit it.
- [ ] Write `security definer` functions with `set search_path = ''` and schema-qualified names.

### Code
- [ ] TypeScript `strict`. No `any`, no `@ts-ignore` without a linked reason.
- [ ] Every Server Action goes through `lib/safe-action.ts` (`publicAction` / `authAction` / `teamAction`: auth, Zod validation and a consistent `{ ok, data } | { ok, error }` result). Call actions from the client with the `useAction` hook.
- [ ] Files with server-only code start with `import "server-only"`.
- [ ] Route files in `app/` stay thin. Logic lives in `features/`.
- [ ] Rebranding and pricing changes must only need edits to `config/` and `globals.css`. If a buyer would have to change anything else, it's a bug.

---

## Request lifecycle cheat-sheet

```
Read:   page.tsx (RSC) → features/x/queries.ts → lib/supabase/server.ts → Postgres (RLS)
Write:  <form action> → features/x/actions.ts → safe-action (auth+zod+role) → server client → Postgres (RLS) → revalidatePath
Pay:    actions.createCheckoutSession → Stripe Checkout → webhook → admin client → subscriptions/purchases
Auth:   (auth) pages → Supabase Auth → /auth/callback | /auth/confirm → session cookie → /dashboard/[teamSlug]
```

## Where things live

| I want to… | Go to |
|---|---|
| Rename the product, change URLs | `src/config/site.ts` |
| Turn auth methods, teams, billing, admin or marketing on/off | `src/config/features.ts` |
| Change plans, prices, feature gates | `src/config/billing.ts` + Stripe dashboard |
| Change landing page copy | `src/config/marketing.ts` |
| Change colors, radius, fonts | `src/app/globals.css` (see [design.md](./design.md)) |
| Add a sidebar link | `src/config/navigation.ts` |
| Add a table | new migration in `supabase/migrations/` + RLS test in `supabase/tests/` |
| Edit an email | `emails/*.tsx` (app emails) or `supabase/templates/*.html` (auth emails) |
| Handle a new Stripe event | `src/features/billing/webhooks/` |
