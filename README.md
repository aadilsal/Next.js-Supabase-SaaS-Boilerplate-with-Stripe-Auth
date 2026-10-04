# Next.js & Supabase SaaS Boilerplate with Stripe Auth

**Ship your SaaS in a weekend, not in two months.** A production-ready starter kit with auth, subscriptions, teams, emails and an admin panel already wired up, so you can start on the part that's actually your product.

![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_+_RLS-3ECF8E?logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Billing-635BFF?logo=stripe&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000)

---

## ✨ What's included

| | Feature | Details |
|---|---|---|
| 🔐 | **Authentication** | Email + password, Google OAuth, magic links, password reset. Secure cookie sessions with `@supabase/ssr` |
| 💳 | **Stripe billing** | Monthly, yearly **and** one-time/lifetime pricing. Hosted Checkout, Customer Portal, signature-verified idempotent webhooks |
| 👥 | **Teams & roles** | Multi-tenant from day one: create teams, invite by email, owner / admin / member roles, team switcher |
| 🛡️ | **Row Level Security** | Every table is protected in Postgres, with automated tests proving tenants can't see each other's data |
| 🧭 | **Dashboard shell** | Responsive collapsible sidebar, profile & security settings, light/dark mode, built with shadcn/ui |
| 🛠️ | **Admin panel** | Platform-wide view of users and teams, hidden from everyone except admins |
| ✉️ | **Transactional emails** | Welcome, team invite, password reset, magic link. React Email templates sent through Resend |
| 🚀 | **Marketing site** | Landing page, pricing table driven by your billing config, FAQ, SEO metadata |

## 🧱 Tech stack

**Next.js** (App Router, Server Components, Server Actions) · **TypeScript** · **Tailwind CSS** · **shadcn/ui** · **Supabase** (Auth, Postgres, RLS) · **Stripe** · **Resend** + **React Email** · **Zod** · **Vitest** · **Playwright**

## ⚡ Quick start

**Prerequisites:** Node.js 20+, pnpm, Docker (for local Supabase), the [Supabase CLI](https://supabase.com/docs/guides/cli) and the [Stripe CLI](https://docs.stripe.com/stripe-cli).

```bash
# 1. Install
pnpm install
cp .env.example .env.local

# 2. Start local Supabase (Postgres, Auth, local email inbox).
#    Copy the printed API URL, anon key and service_role key into .env.local.
pnpm db:start
pnpm db:reset          # apply migrations + seed demo accounts

# 3. Run
pnpm dev

# 4. (Optional) Billing: add Stripe test keys + price IDs to .env.local, then
pnpm stripe:listen     # copy the printed whsec_… into STRIPE_WEBHOOK_SECRET
```

Open <http://localhost:3000> and sign in with a seeded account (password `password123`):
`owner@example.com` (team owner), `member@example.com` (team member) or `admin@example.com` (platform admin).
Emails sent by Supabase show up in the local inbox at <http://localhost:54324>. App emails are printed to the console until you set `RESEND_API_KEY`.

The full step-by-step guide, including creating Stripe products, setting up Google OAuth and deploying to Vercel, is in **[docs/](docs/README.md)**.

## 🎨 Make it yours

Rebranding takes minutes and touches only a few files:

| Change | File |
|---|---|
| Product name, URLs, support email | `src/config/site.ts` |
| Plans, prices, feature limits | `src/config/billing.ts` |
| Colors, radius, fonts | `src/app/globals.css` |
| Sidebar navigation | `src/config/navigation.ts` |
| Logo & favicon | `public/` |

## 📁 Project structure

```
src/
├── app/            # Routes: (marketing), (auth), (app)/dashboard/[teamSlug], admin, api/webhooks
├── features/       # One folder per domain: auth, teams, billing, account, admin, email
├── components/     # ui/ (shadcn), shared/ (AppShell, TextField, …), marketing/
├── config/         # site, features, billing, marketing, navigation: everything you customize
└── lib/            # Supabase clients, Stripe, safe Server Action wrapper
supabase/           # migrations, RLS tests, auth email templates, seed
emails/             # React Email templates
```

## 📚 Documentation

- [Docs index](docs/README.md)
- [Architecture essentials](docs/architecture-essentials.md): the rules that keep your app secure
- [Architecture](docs/architecture.md): auth, teams, schema, RLS, billing and email in depth
- [Design system](docs/design.md): layouts, tokens, components, accessibility

## 🤖 AI-assistant ready

The repo ships with [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md), so Claude Code, Cursor, Codex and Copilot follow its conventions and security rules from the first prompt.

## 📄 License

Sold under a one-time **lifetime license**: unlimited personal and commercial projects. You may not resell or redistribute the boilerplate itself. See [`LICENSE`](LICENSE) for full terms.

---

Built by **TechVersa**.
