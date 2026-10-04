<div align="center">

# VersaLaunch

**Next.js & Supabase SaaS Boilerplate with Stripe Auth** · by TechVersa

### Launch your SaaS this weekend, not in two months.

Auth, Stripe subscriptions, multi-tenant teams, transactional emails and an admin panel, already wired together and secured.<br/>
Skip 4–6 weeks of setup and start building the part that's actually your product.

![Next.js 16](https://img.shields.io/badge/Next.js_16-App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_+_RLS-3ECF8E?logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Subscriptions-635BFF?logo=stripe&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000)

**[Get the boilerplate](#-get-it)** · **[See what's inside](#-everything-you-need-on-day-one)** · **[Quick start](#-up-and-running-in-15-minutes)**

</div>

---

## 😩 The problem

Every SaaS needs the same foundation before it can do anything useful: sign-up and login, password resets, a billing system that doesn't double-charge, teams with roles and invitations, emails that actually arrive, and a database that never leaks one customer's data to a

Building that properly takes **4–6 weeks**. Building it badly costs you customers.

## ✅ The solution

This boilerplate is that foundation, done properly. Clone it, add your keys and you have a working, secure SaaS. Then spend your time on the feature your customers are paying for.

| Without this boilerplate | With it |
|---|---|
| A week fighting OAuth redirects and session cookies | Email + password, Google and magic links, working on the first run |
| Stripe webhooks that break when events arrive twice or out of order | Signed, idempotent webhooks that re-sync from Stripe on every event |
| `WHERE user_id = ...` scattered through your code, one bug away from a data leak | Postgres Row Level Security on every table, with pgTAP tests |
| Bolting on teams later and rewriting every query | Multi-tenant from day one: teams, roles, invitations |
| Weeks of UI work for settings, billing and admin pages | A polished, accessible dashboard you just rebrand |

---

## 🎁 Everything you need on day one

### 🔐 Authentication that just works
- Email + password, **Google OAuth** and **magic links**, plus password reset and email confirmation
- Secure cookie sessions with `@supabase/ssr`, verified on the server for every request
- Open-redirect protection, rate-limited auth emails, "sign out everywhere" and account deletion

### 💳 Stripe billing for every pricing model
- **Monthly, yearly and one-time/lifetime** plans from a single config file
- Hosted Stripe Checkout and the **Customer Portal**, so customers upgrade, update cards and download invoices themselves
- Webhooks with signature verification, **idempotency** and automatic retry handling. Refunds remove access automatically
- Plan **entitlements and seat limits** you can check anywhere: `hasEntitlement(team, "api_access")`
- **Live product catalog**: Stripe products and prices synced into your database, so the pricing page always shows real prices in any currency, and archived prices can't be bought

### 👥 B2B multi-tenancy built in
- Teams with **owner / admin / member** roles and a team switcher
- Email invitations with hashed, single-use links that expire after 7 days
- Database-enforced rules: a team can never lose its last owner, and admins can't remove owners
- Every user gets a personal workspace, so B2C apps work out of the box too

### 🛡️ Security you can show your customers
- **Row Level Security on every table.** Tenants can't see each other's data even if your app code has a bug
- Service-role access limited to the webhook and admin panel
- Strict Zod validation on every Server Action, with friendly errors and no leaked stack traces
- Out-of-scope teams return **404, not 403**, so team slugs can't be discovered by guessing

### 🧭 A dashboard your users will like
- Collapsible sidebar, team switcher, plan badge and user menu built on **shadcn/ui**
- Team settings, members, invitations, billing, profile and security pages
- **Light and dark mode**, keyboard accessible and responsive down to 360px
- Loading skeletons, empty states and error pages included

### 🛠️ Admin panel
- Platform-wide stats, user and team search, ban and unban
- Platform-wide **audit log** and **application error log** viewers
- Hidden from everyone else (non-admins get a 404)
- Grant access with one command: `pnpm admin:grant you@company.com`

### 📊 Audit logs & production monitoring
- **Tamper-proof audit log** of every sign-in, failed sign-in, password change, team change, invitation, role change, purchase and refund, with who, when, IP address and user agent
- Team owners see their team's audit log, and every user sees their own **recent activity**, so suspicious logins are easy to spot
- **Structured JSON logging** with warnings and errors stored in your database, plus a viewer in the admin panel
- **Sentry** error tracking and performance tracing for browser, server and edge. Add a DSN and it's on
- Built-in retention function to purge old logs on a schedule

### ✉️ Transactional emails
- Welcome, team invitation, confirmation, magic link and password reset
- **React Email** templates sent through **Resend**, branded from one config file
- No email provider yet? Emails are printed to the console so every flow still works

### 🚀 Marketing site included
- Landing page, pricing page (driven by your billing config), FAQ, legal pages
- SEO metadata, sitemap and robots.txt
- Every word of landing page copy lives in one config file

---

## 🎨 Make it yours in minutes

No digging through components. Everything you customize lives in `src/config/`:

| Change | File |
|---|---|
| Product name, URLs, support email, company details | `src/config/site.ts` |
| Turn Google login, magic links, teams, billing, admin or the landing page on/off | `src/config/features.ts` |
| Plans, prices, entitlements, seat limits, trial length | `src/config/billing.ts` |
| Landing page copy: hero, features, FAQ, CTA | `src/config/marketing.ts` |
| Sidebar navigation | `src/config/navigation.ts` |
| Log levels, Sentry sampling, audit log, retention | `src/config/observability.ts` |
| Brand colors and corner radius | `src/app/globals.css` |
| Logo and fonts | `src/components/shared/logo.tsx`, `src/app/layout.tsx` |

Building a single-user app? Set `teams.enabled: false`. Don't need billing yet? `billing: false`. The UI adapts automatically.

Step-by-step recipes for rebranding, adding plans, gating features and adding modules: **[docs/customization.md](docs/customization.md)**.

---

## 🧱 Built on the stack developers are hiring for

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions) + **TypeScript** strict |
| UI | **Tailwind CSS v4** + **shadcn/ui** (Radix) |
| Database & auth | **Supabase** (Postgres, Auth, Row Level Security) |
| Payments | **Stripe** (Checkout, Customer Portal, webhooks) |
| Email | **Resend** + **React Email** |
| Monitoring | **Sentry** + structured logs in Postgres |
| Forms & validation | **react-hook-form** + **Zod** |
| Testing | **Vitest**, **Playwright**, **pgTAP** |

No ORM, no extra state library, no API layer to learn. Fewer moving parts means fewer things to break.

## 🧑‍💻 Code you can actually read

You'll read and change every file, so we wrote it for you, not for us:

- **One folder per feature** (`auth`, `teams`, `billing`, `account`, `admin`), each with the same `schemas / queries / actions / components` shape. Learn one and you know them all.
- **Comments explain why**, not what.
- **Documented architecture**: a one-page list of security rules, a full design doc and a design system guide.
- **AI-assistant ready**: ships with [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md), so Claude Code, Cursor, Codex and Copilot follow the project's conventions and security rules from the first prompt.

---

## ⚡ Up and running in 15 minutes

**You'll need:** Node.js 20.9+, pnpm and Docker. For billing, also the [Stripe CLI](https://docs.stripe.com/stripe-cli).

```bash
# 1. Install
pnpm install
cp .env.example .env.local

# 2. Start local Supabase (Postgres, Auth and a local email inbox).
#    Copy the printed API URL, anon key and service_role key into .env.local.
pnpm db:start
pnpm db:reset          # apply migrations + seed demo accounts

# 3. Run
pnpm dev

# 4. (Optional) Billing: add Stripe test keys + price IDs to .env.local, then
pnpm stripe:sync       # copy your Stripe products and prices into the database
pnpm stripe:listen     # copy the printed whsec_… into STRIPE_WEBHOOK_SECRET
```

Open <http://localhost:3000> and sign in with a demo account (password `password123`):

| Account | Role |
|---|---|
| `owner@example.com` | Owner of the "Acme Inc" team |
| `member@example.com` | Member of "Acme Inc" |
| `admin@example.com` | Platform admin (can open `/admin`) |

Supabase emails land in the local inbox at <http://localhost:54324>.

## 💳 Testing Stripe webhooks locally

Stripe can't reach `localhost`, so the [Stripe CLI](https://docs.stripe.com/stripe-cli) forwards events to your machine:

```bash
stripe login                                                   # once
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # same as: pnpm stripe:listen
```

Copy the `whsec_…` signing secret it prints into `STRIPE_WEBHOOK_SECRET` in `.env.local`, then restart `pnpm dev`. Keep `stripe listen` running while you test.

**Try a full payment:** sign in as `owner@example.com`, open **Settings → Billing**, choose a plan and pay with the test card `4242 4242 4242 4242` (any future date, any CVC). The webhook writes the subscription to your database and the plan updates within seconds. You can also fire individual events:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

**In production**, add an endpoint in Stripe Dashboard → Developers → Webhooks pointing to `https://yourdomain.com/api/webhooks/stripe`, subscribe it to the events listed in [`HANDLED_EVENTS`](src/features/billing/webhooks/handlers.ts), and put its signing secret in your host's environment variables.

## 🗄️ Database setup: CLI or SQL Editor?

The schema lives in versioned migration files in [`supabase/migrations/`](supabase/migrations/). **Use the Supabase CLI.** It's already installed as a dev dependency.

**Local development:** `pnpm db:start` then `pnpm db:reset` applies every migration plus the demo data in `supabase/seed.sql`. Run `pnpm db:test` to execute the Row Level Security tests.

**Production, recommended (CLI):**

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <your-project-ref>   # from your project's URL / settings
pnpm db:push                                               # applies all pending migrations
```

The CLI records which migrations have run, so when you install a VersaLaunch update, `pnpm db:push` applies only the new ones.

**Production, alternative (SQL Editor):** if you can't use the CLI, open Supabase Dashboard → SQL Editor and run each file in `supabase/migrations/` **one at a time, in filename order** (oldest first). Don't run `seed.sql` in production: it creates demo accounts. With this method you must apply future migrations by hand, in order.

After either method, run `pnpm stripe:sync` (with production env vars) to load your Stripe prices.

## 📚 Documentation

| Guide | What's in it |
|---|---|
| [Customization](docs/customization.md) | Rebrand, toggle features, change plans, add modules |
| [Architecture essentials](docs/architecture-essentials.md) | The security rules on one page |
| [Architecture](docs/architecture.md) | Auth, teams, schema, RLS, billing and email in depth |
| [Design system](docs/design.md) | Layouts, design tokens, components, accessibility |

---

## 🙋 FAQ

**Who is this for?**
Solo developers, indie hackers and agencies who want to launch a SaaS without rebuilding the same foundation, and non-technical founders handing a solid base to a freelancer.

**Can I use it for client projects?**
Yes. The license covers unlimited personal and commercial projects.

**Do I need to use teams and billing?**
No. Turn either off in `src/config/features.ts` and the UI adapts.

**Where can I host it?**
Vercel + Supabase Cloud is the recommended setup, but any Node.js host works.

**Is it secure?**
Data isolation is enforced by Postgres Row Level Security, not just app code. Payments are handled entirely by Stripe-hosted pages, so card data never touches your server.

---

## 🛒 Get it

One payment. **Lifetime access** to the code and all future updates.

<!-- TODO: add the Gumroad product link -->
**Available on Gumroad.**
https://aadilsalman.gumroad.com/l/versalaunch

## 📄 License

Sold under a one-time **lifetime license**: unlimited personal and commercial projects. You may not resell or redistribute the boilerplate itself as a template or starter kit.

---

<div align="center">

Built by **TechVersa**

</div>
