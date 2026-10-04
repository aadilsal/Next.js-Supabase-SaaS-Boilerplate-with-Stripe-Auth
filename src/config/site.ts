/**
 * Your product's identity. Rebranding starts here.
 *
 * Also update:
 *  - colors, radius, fonts      -> src/app/globals.css (+ font in src/app/layout.tsx)
 *  - logo                       -> src/components/shared/logo.tsx
 *  - favicon / social image     -> src/app/favicon.ico, src/app/opengraph-image.png
 *  - auth email HTML            -> supabase/templates/*.html (name + brandColor)
 */
export const siteConfig = {
  name: "VersaLaunch",
  tagline: "Launch your SaaS this weekend",
  description:
    "VersaLaunch is the production-ready Next.js & Supabase SaaS boilerplate with Stripe billing, multi-tenant teams, audit logs and transactional emails built in.",

  /** Absolute URL of the deployed app. Set NEXT_PUBLIC_SITE_URL per environment. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // TODO: replace with your real support address before launch.
  supportEmail: "support@example.com",

  /** Shown in the footer, legal pages and email footers. */
  company: {
    legalName: "TechVersa",
    // TODO: replace with your registered business address (required in email footers in many countries).
    address: "Your business address",
  },

  /** Leave a link empty ("") to hide it. */
  social: {
    // TODO: add your profiles, e.g. "https://x.com/techversa".
    twitter: "",
    github: "",
  },

  /**
   * Used in emails, where CSS variables aren't available.
   * Keep it in sync with --primary in globals.css.
   */
  brandColor: "#4f46e5",
} as const;

export type SiteConfig = typeof siteConfig;
