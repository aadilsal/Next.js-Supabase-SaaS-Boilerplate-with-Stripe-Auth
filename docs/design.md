# Design

The UI and visual system for the boilerplate. Buyers will rebrand it within an hour of downloading it, so the design must be **neutral, polished and easy to re-theme from one file**.

---

## 1. Principles

1. **Neutral by default, brandable in one place.** The design ships as a clean neutral theme with one accent color. All colors, radius and fonts are CSS variables in `src/app/globals.css`.
2. **shadcn/ui first.** Use an existing shadcn component before building a custom one. Custom components are compositions of shadcn primitives in `components/shared/`.
3. **Every screen has four states.** Loading, empty, error and populated. A screen isn't done until all four are designed.
4. **Accessible is the baseline.** WCAG 2.2 AA. Everything works with the keyboard, focus is always visible, and color is never the only signal.
5. **Mobile works, desktop shines.** The app shell is designed for desktop and has to be fully usable at 360px wide.

---

## 2. Design tokens

Tokens follow the shadcn/ui convention (`oklch` CSS variables, mapped into Tailwind v4 through `@theme inline`). `.dark` overrides the same names.

| Token | Role | Light (default) | Dark (default) |
|---|---|---|---|
| `--background` / `--foreground` | Page surface & text | near-white / near-black | near-black / near-white |
| `--card` / `--card-foreground` | Cards, panels | white | slightly raised neutral |
| `--primary` / `--primary-foreground` | Accent: primary buttons, links, active nav | brand indigo | lighter indigo |
| `--secondary` | Secondary buttons, subtle fills | neutral 100 | neutral 800 |
| `--muted` / `--muted-foreground` | Helper text, disabled, table headers | neutral 100 / 500 | neutral 800 / 400 |
| `--accent` | Hover backgrounds | neutral 100 | neutral 800 |
| `--destructive` | Delete, errors | red 600 | red 500 |
| `--success` / `--warning` *(added)* | Status badges, banners | green 600 / amber 500 | green 500 / amber 400 |
| `--border` / `--input` / `--ring` | Borders, inputs, focus ring | neutral 200 / 200 / primary | neutral 800 / 800 / primary |
| `--sidebar-*` | Sidebar surface, active item | shadcn sidebar defaults | |
| `--radius` | Base corner radius | `0.625rem` | |

**Rules**
- Components use **semantic tokens only** (`bg-primary`, `text-muted-foreground`), never raw palette classes like `bg-indigo-600`. That's what makes one-file rebranding work.
- Every foreground/background pair must reach a 4.5:1 contrast ratio (3:1 for large text and UI borders) in **both** themes.

### Typography
- **Font:** Geist Sans for UI and Geist Mono for code and IDs, loaded through `next/font` (self-hosted, no layout shift). Swap them in `src/app/layout.tsx`.
- **Scale (Tailwind):** `text-xs` (meta) · `text-sm` (body in the app, tables, forms) · `text-base` (marketing body) · `text-lg`/`text-xl` (card titles) · `text-2xl` (page titles) · `text-4xl`–`text-6xl` (marketing hero).
- Page titles use `font-semibold tracking-tight`. Avoid more than two weights on one screen.

### Spacing & layout
- 4px base grid (Tailwind default). Common rhythm: `gap-2` inside controls, `gap-4` between fields, `gap-6`/`gap-8` between sections.
- App content max width is `max-w-6xl`. Settings forms are `max-w-2xl`. Marketing sections are `max-w-7xl` with `py-16 md:py-24`.

### Theme switching
- `next-themes` with `system` / `light` / `dark`, using the `class` strategy. The toggle sits in the user menu and the marketing footer.

---

## 3. Layouts

### 3.1 Marketing layout: `app/(marketing)`
```
┌────────────────────────────────────────────────────────┐
│ Logo   Features  Pricing  Docs           Sign in  [Get started] │  sticky, blurred bg
├────────────────────────────────────────────────────────┤
│ Hero: headline · subhead · primary CTA · product screenshot │
│ Logos / social proof (optional)                         │
│ Feature grid (3×2): Auth · Billing · Teams · Emails · Admin · RLS │
│ Pricing table (monthly/yearly toggle + lifetime card)   │
│ FAQ (accordion)                                         │
│ Final CTA band                                          │
├────────────────────────────────────────────────────────┤
│ Footer: links · legal · theme toggle                    │
└────────────────────────────────────────────────────────┘
```
On mobile the header nav collapses into a `Sheet`. The pricing table reads plans from `config/billing.ts`, so it's never out of sync with checkout.

### 3.2 Auth layout: `app/(auth)`
A centered `Card` (`max-w-sm`) on a muted background, with the logo above it. Order on the sign-in card:
1. **Continue with Google** (outline button with the Google icon)
2. Divider: "or"
3. Email field, then tabs or a link to switch between **Password** and **Email me a magic link**
4. Primary submit button (full width)
5. Footer links: "Forgot password?" · "Don't have an account? Sign up"

After submitting a magic link or sign-up, the card switches to a **"Check your email"** state that shows the address and a "Resend" button with a 60s cooldown.

### 3.3 App shell: `app/(app)`
```
┌──────────────┬─────────────────────────────────────────┐
│ [Team ▾]     │ Breadcrumbs                    [User ▾] │  ← top bar (h-14)
│──────────────│─────────────────────────────────────────│
│ ◻ Dashboard  │ Page title                  [Primary CTA]│  ← PageHeader
│ ◻ …app nav   │ Description                              │
│              │                                          │
│ Settings     │  Content                                 │
│ ◻ General    │                                          │
│ ◻ Members    │                                          │
│ ◻ Billing    │                                          │
│              │                                          │
│──────────────│                                          │
│ Plan: Pro ⓘ  │                                          │
│ [Upgrade]    │                                          │
└──────────────┴─────────────────────────────────────────┘
```
- Built on the shadcn **`Sidebar`** component. It collapses to icons on desktop (`⌘/Ctrl + B`) and becomes an off-canvas `Sheet` below `md`.
- **Team switcher** (top of the sidebar): a `DropdownMenu` listing the user's teams with avatars, plus "Create team". Switching teams navigates to `/dashboard/<slug>`.
- **User menu** (top right): avatar, then name/email, Account settings, Theme, Admin *(platform admins only)*, Sign out.
- **Plan card** (bottom of the sidebar): the current plan and an Upgrade button for owners on the Free plan.
- Sidebar items come from `config/navigation.ts`. Items can declare `roles` so they're hidden from members who can't use them.

### 3.4 Admin layout: `app/admin`
The same shell component with a separate nav (Overview · Users · Teams) and a persistent **"Admin"** badge in the top bar, so it's always clear you're in a cross-tenant view.

---

## 4. Page inventory

| Route | Page | Key components | Notes |
|---|---|---|---|
| `/` | Landing | Hero, FeatureGrid, PricingTable, FAQ, CTA | Static, SEO metadata + OG image |
| `/pricing` | Pricing | PricingTable, comparison table, FAQ | Interval toggle defaults to yearly ("Save 20%") |
| `/sign-in`, `/sign-up` | Auth | AuthCard, OAuthButton, MagicLinkForm, PasswordForm | |
| `/forgot-password`, `/reset-password` | Recovery | AuthCard, PasswordForm with strength hint | |
| `/dashboard/[teamSlug]` | Team home | PageHeader, StatCards, EmptyState | Placeholder content for buyers to replace |
| `/dashboard/[teamSlug]/settings` | Team general | Form (name, slug), DangerZone (delete team) | Delete requires typing the team name |
| `/dashboard/[teamSlug]/settings/members` | Members | MembersTable, InviteDialog, RoleSelect, PendingInvites | Role select disabled where not permitted |
| `/dashboard/[teamSlug]/settings/billing` | Billing | CurrentPlanCard, PricingTable, "Manage billing" → Portal | Non-owners see a read-only plan card |
| `/account` | Profile | Form (name), email (read-only) | Avatar comes from Google; uploads are a planned extension |
| `/account/security` | Security | Change password, connected providers, sign out everywhere, delete account | |
| `/invite/[token]` | Accept invite | Card: "<Inviter> invited you to <Team>" + Accept / Decline | Handles expired, used and wrong-account states |
| `/admin`, `/admin/users`, `/admin/teams` | Admin | StatCards, `Table` + AdminSearch + AdminPagination, BanUserButton | |
| `not-found`, `error` | System | Centered message + "Go to dashboard" | |

---

## 5. Shared components (`components/shared/`)

| Component | Purpose |
|---|---|
| `AppShell` | Sidebar + top bar + content slot. Used by app and admin |
| `PageHeader` | Title, description, optional actions slot. Every app page starts with it |
| `EmptyState` | Icon, title, one sentence, primary action |
| `ConfirmDialog` | `AlertDialog` for destructive actions, with optional "type to confirm" |
| `TextField` (`form-fields.tsx`) | shadcn `Field` + `Input` + react-hook-form `Controller`. Inline errors under the field |
| `SubmitButton` | Button with a spinner, disabled while pending |
| `PlanBadge`, `RoleBadge`, `StatusBadge` | Consistent colored `Badge` variants |
| `UserAvatar` | Avatar image with initials fallback |
| `UpgradeGate` (`features/billing/components`) | Server Component. Shows an upgrade prompt if `hasEntitlement()` is false |

Tables use the plain shadcn `Table`; there's no table library to learn.
| `Logo` | Reads from `config/site.ts`. Swap the SVG in one place |

---

## 6. Interaction patterns

- **Feedback:** Server Action results show as a **toast** (`sonner`), with success in neutral and errors in destructive color. Field-level validation errors show **inline**, never as a toast.
- **Pending state:** Submit buttons show a spinner and stay disabled until the action resolves (`useFormStatus` / `useActionState`). Don't use optimistic UI for billing or membership.
- **Loading:** Each route has a `loading.tsx` with `Skeleton`s shaped like the real content. No full-page spinners.
- **Destructive actions:** Always use `ConfirmDialog`, use specific verbs ("Remove Jane from Acme"), and put the destructive button on the right.
- **Billing return:** After Stripe Checkout, `/settings/billing?checkout=success` shows "Finalizing your subscription…" and polls until the webhook has written the plan (timeout after 30s, then show a support link).
- **Copy tone:** Short, plain and second person. Buttons are verbs ("Invite member", not "Submit").

---

## 7. Accessibility checklist

- [ ] All interactive elements are reachable and work with the keyboard. Visible `focus-visible:ring` comes from `--ring`.
- [ ] Every input has a `<label>`. Errors are linked with `aria-describedby` and announced.
- [ ] Icon-only buttons have `aria-label` (sidebar collapse, row action menus, theme toggle).
- [ ] Dialogs and sheets trap focus and return it to the trigger (Radix does this by default, so don't override it).
- [ ] Contrast meets AA in light **and** dark.
- [ ] `prefers-reduced-motion` turns off non-essential animation.
- [ ] Touch targets are at least 24×24px (44px preferred on mobile nav).
- [ ] The page `<title>` updates per route through the Metadata API.

---

## 8. Email design

- A single-column layout, 600px max, with the logo at the top, one heading, a short body, **one** primary button and a muted footer (company address + "why you got this").
- Use the same primary color and logo as the app. React Email templates import them from `config/site.ts`. The Supabase auth HTML templates hard-code the same values, with a comment pointing to `site.ts`.
- Every button has a plain-text link under it, for email clients that block buttons.

---

## 9. Rebranding guide (for buyers)

1. `src/config/site.ts`: name, tagline, URLs, support email, social links, `brandColor` for emails.
   `src/config/marketing.ts`: all landing page copy.
2. `src/app/globals.css`: change `--primary` (and optionally `--radius`, `--sidebar-*`). Use the [shadcn theme generator](https://ui.shadcn.com/themes) to produce a full set.
3. `src/components/shared/logo.tsx`: swap `<LogoMark />` for your SVG. Replace `src/app/favicon.ico`.
4. `src/app/layout.tsx`: swap the font if you want.
5. `supabase/templates/*.html`: update the color hex and logo URL.

If you have to change anything outside these files to rebrand, it's a bug, so please report it.
