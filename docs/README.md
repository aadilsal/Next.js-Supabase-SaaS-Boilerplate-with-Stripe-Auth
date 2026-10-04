# Documentation

The index for all product and engineering docs. Start at the top and read down.

| Doc | Read it when… | Audience |
|---|---|---|
| [PRD.md](./PRD.md) | You need to know **what** we're building and **why** | Everyone |
| [architecture-essentials.md](./architecture-essentials.md) | Before writing **any** code. It has the non-negotiable rules on one page | Engineers, AI agents |
| [architecture.md](./architecture.md) | You're working on auth, teams, billing, email, the schema or RLS | Engineers |
| [design.md](./design.md) | You're building or changing UI, or rebranding | Engineers, designers |
| [customization.md](./customization.md) | You want to rebrand, toggle features, change plans or add a module | Buyers, engineers |

Repo-level files:

| File | Purpose |
|---|---|
| [`/README.md`](../README.md) | The public GitHub / buyer-facing overview and quick start |
| [`/AGENTS.md`](../AGENTS.md) | Instructions for AI coding agents (Codex, Cursor, Copilot, Claude, etc.) |
| [`/CLAUDE.md`](../CLAUDE.md) | Claude Code entry point. It imports `AGENTS.md` and adds Claude-specific notes |

## Planned (Phase 2, week 3)

The PRD names poor documentation as the main reason templates get refunded. These buyer-facing guides ship before launch:

- `getting-started.md`: zero to running locally in 15 minutes, with screenshots for every dashboard step (Supabase, Stripe, Google Cloud, Resend)
- `deployment.md`: Vercel + Supabase production checklist
- `troubleshooting.md`: the 15 most likely errors and their fixes (webhook signature, OAuth redirect mismatch, missing env var, RLS denies…)

## Keeping docs honest

- When code changes behavior described here, update the doc **in the same PR**.
- `architecture.md` §14 ("Key decisions") is append-only. If you reverse a decision, add a new row explaining why instead of deleting the old one.
