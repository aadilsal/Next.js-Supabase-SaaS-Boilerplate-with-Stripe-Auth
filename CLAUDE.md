# CLAUDE.md

@AGENTS.md

## Claude Code notes

- **Read [docs/architecture-essentials.md](docs/architecture-essentials.md) before your first edit in a session.** Open [docs/architecture.md](docs/architecture.md) for the section you're touching (auth §4, teams §5, schema/RLS §6, billing §7, email §8, admin §9).
- **For any change to SQL, RLS, auth, the webhook or `lib/supabase/admin.ts`:** say in your summary which policies or checks protect the change and which tests cover it. Treat these areas as security-critical.
- **Plan before multi-file work.** Anything that touches more than one feature folder, or adds a table, gets a short plan first.
- **Verify, don't assume.** Run the commands in AGENTS.md ("Commands") and report real output. If something can't be run (e.g. Docker isn't running for `supabase start`), say so instead of claiming it passed.
- **Stripe locally:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. Trigger events with `stripe trigger checkout.session.completed`.
- **shadcn components:** add them with the CLI (`pnpm dlx shadcn@latest add …`) rather than writing primitives by hand.
- **Library APIs change quickly** (Next.js, `@supabase/ssr`, Stripe API versions, Tailwind v4). Check current docs before relying on memory for a specific API signature.
