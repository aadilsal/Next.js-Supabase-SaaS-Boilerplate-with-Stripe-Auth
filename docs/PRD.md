# Product Requirements Document

**Product name:** Next.js & Supabase SaaS Boilerplate with Stripe Auth
*(Name chosen to match Gumroad search terms exactly.)*

**Owner:** TechVersa
**Status:** Approved for development

---

## 1. Product Overview

**Target audience:** Solo developers, indie hackers and non-technical founders who want to build a software product but get stuck on the initial setup.

**Core value proposition:** A production-ready starter kit with all the infrastructure a SaaS application needs. Buyers skip 4 to 6 weeks of backend configuration and can launch an MVP in one weekend.

**Business goal:** Build a high-quality, reusable digital product that earns passive revenue on platforms like Gumroad, with no ongoing marketing spend.

## 2. Core Technology Stack

To match what developers are asking for in 2026, the template uses this stack:

| Layer | Choice |
|---|---|
| Frontend framework | Next.js (App Router) with TypeScript |
| UI & styling | Tailwind CSS and shadcn/ui, for accessible components that are easy to customize |
| Backend & database | Supabase (PostgreSQL) with Row Level Security (RLS) protecting the data |
| Payments | Stripe, with webhooks configured |

## 3. Required Features (MVP Deliverable)

The buyer receives a zip file or access to a GitHub repository. Each of the following components comes ready to use:

1. **Authentication system.** Secure, working endpoints for email/password sign-up, Google OAuth and magic links.
2. **Subscription billing engine.** Stripe Checkout, set up for monthly, yearly and one-time pricing, plus a customer billing portal.
3. **Dashboard & UI shell.** A responsive application shell with a sidebar, user profile settings and an admin panel.
4. **Multi-tenancy / team support.** Users can create teams, invite members and assign basic roles. B2B SaaS buyers ask for this often.
5. **Transactional emails.** Email templates for password resets, welcome messages and team invitations.

## 4. Go-To-Market & Distribution Strategy

**Pricing:** Sold as a one-time lifetime license. Competing boilerplates sell for $149 to $349, depending on their features.

**Distribution platform:** Gumroad. Selling the code as a Gumroad product means we don't have to build e-commerce infrastructure, and Gumroad handles global tax compliance.

**Marketing (zero budget):** We opt into **Gumroad Discover**, which lets the platform's algorithm show the boilerplate to Gumroad's large existing audience of developers. In return, Gumroad takes a slightly higher transaction fee. Success depends on exact SEO tags (e.g. "Next.js SaaS template", "Stripe setup") instead of paid ads.

## 5. Development Phasing

| Phase | Timeline | Scope |
|---|---|---|
| **Phase 1: Build** | Weeks 1–2 | Engineers build the core codebase. It must be modular and easy for a stranger to read. Code we sell has to be cleaner and better organized than code for an internal tool. |
| **Phase 2: Document** | Week 3 | Write complete, step-by-step documentation. Poor documentation is the main reason code templates get refunded. Include a step-by-step "Getting Started" guide. |
| **Phase 3: Launch** | Week 4 | Launch on Gumroad, set the SEO tags and let the platform's search engine start indexing the product. |

---

## Related documents

- [Architecture](./architecture.md): the full technical design
- [Architecture Essentials](./architecture-essentials.md): the rules that must never be broken
- [Design](./design.md): UI, layout and visual system
