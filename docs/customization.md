# Customization guide

Recipes for making the boilerplate your own. Most changes happen in `src/config/`, which holds only settings and no logic.

| File | What it controls |
|---|---|
| `src/config/site.ts` | Product name, tagline, URL, support email, company details, social links, email brand color |
| `src/config/features.ts` | On/off switches for whole areas of the product |
| `src/config/billing.ts` | Plans, prices, entitlements, seat limits, trial length |
| `src/config/marketing.ts` | All landing page copy |
| `src/config/navigation.ts` | Sidebar items |
| `src/app/globals.css` | Colors, radius (design tokens) |

---

## Rebrand in 10 minutes

1. **Name & details:** edit `src/config/site.ts`.
2. **Colors:** in `src/app/globals.css`, change `--primary` (and `--ring`, `--sidebar-primary`) in both `:root` and `.dark`. The [shadcn theme generator](https://ui.shadcn.com/themes) produces a full palette you can paste in. Then set `brandColor` in `site.ts` to the same color for emails.
3. **Logo:** replace `<LogoMark />` in `src/components/shared/logo.tsx` with your SVG, and replace `src/app/favicon.ico`.
4. **Font:** swap `Geist` in `src/app/layout.tsx` for any `next/font/google` font. Keep the `--font-geist-sans` variable name, or update it in `globals.css`.
5. **Auth emails:** update the name and color in `supabase/templates/*.html`.
6. **Landing page:** rewrite the copy in `src/config/marketing.ts`.

Components only use semantic color classes (`bg-primary`, `text-muted-foreground`), so these changes apply everywhere.

## Turn features on or off

Edit `src/config/features.ts`:

```ts
auth: { password: true, magicLink: true, google: false }, // hide "Continue with Google"
teams: { enabled: false, allowCreate: false },              // single-user app, no team UI
billing: false,                                             // hide pricing and billing pages
admin: true,
marketing: false,                                           // "/" goes straight to the app
```

Also turn the provider on or off in Supabase. For example, disable Google under Authentication → Providers.

## Change plans and prices

1. In Stripe, create a Product with a Price (recurring or one-time).
2. Put the Price ID in `.env.local`, e.g. `NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY=price_...`.
3. Add or edit the plan in `src/config/billing.ts`:

```ts
{
  id: "team",
  name: "Team",
  description: "For larger teams.",
  features: ["Up to 50 members", "SSO"],          // shown on the pricing table
  entitlements: ["projects", "advanced_analytics"], // checked in code
  limits: { members: 50 },                          // enforced when inviting
  prices: [{ interval: "month", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY, amount: 49 }],
}
```

`amount` is only used for display, so keep it in sync with Stripe. Other settings in the same file: `defaultInterval`, `yearlyDiscountLabel`, `trialDays`, `allowPromotionCodes`.

## Gate a feature by plan

1. Add a key to `ENTITLEMENTS` in `src/config/billing.ts` and to the plans that include it.
2. Hide the UI with the `UpgradeGate` Server Component:

```tsx
<UpgradeGate team={team} entitlement="advanced_analytics">
  <AnalyticsChart />
</UpgradeGate>
```

3. **Also** enforce it in the Server Action, because hidden UI is not security:

```ts
const entitlements = await getTeamEntitlements(team.id);
if (!hasEntitlement(entitlements, "advanced_analytics")) throw new ActionError("Upgrade to use analytics.");
```

## Add a page to the app

1. Create `src/app/(app)/dashboard/[teamSlug]/projects/page.tsx` and start it with `const team = await requireTeam((await params).teamSlug)`.
2. Add it to the sidebar in `src/config/navigation.ts`:
   `{ title: "Projects", path: "/projects", icon: FolderKanban }`. Add `roles: ["owner", "admin"]` to hide it from members.

## Add a feature module with its own table

Follow the same shape as `src/features/teams`:

1. **Migration:** `supabase migration new projects`, then write the SQL. Every table needs a `team_id`, `enable row level security`, and policies using `public.is_team_member(team_id)` / `public.has_team_role(team_id, ...)`.
2. **RLS tests:** add both allowed and denied cases to `supabase/tests/`, then run `pnpm db:reset && pnpm db:test`.
3. **Types:** `pnpm db:types`.
4. **Code:** `src/features/projects/{schemas.ts, queries.ts, actions.ts, components/}`. Write mutations with `teamAction(schema, { roles }, handler)` and call them from the client with `useAction`.

## Add a sign-in provider (e.g. GitHub)

1. Enable it in Supabase and in `supabase/config.toml` (`[auth.external.github]`).
2. Add `"github"` to `oauthSchema` in `src/features/auth/schemas.ts`.
3. Add a flag in `features.auth` and a button in `src/features/auth/components/oauth-buttons.tsx`.

## Add an email

1. Create `emails/my-email.tsx` using `EmailLayout` (preview it with `pnpm email:dev`).
2. Add a `sendMyEmail()` helper in `src/features/email/send.ts`.
3. Call it from a Server Action. To switch email providers, rewrite only `sendEmail()` in that file.

## Make someone a platform admin

```bash
pnpm admin:grant you@example.com           # grant
pnpm admin:grant you@example.com --revoke  # revoke
```
