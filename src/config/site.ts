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
  name: "Acme",
  tagline: "Launch your SaaS this weekend",
  description:
    "The production-ready Next.js & Supabase starter with auth, Stripe billing, teams and transactional emails built in.",

  /** Absolute URL of the deployed app. Set NEXT_PUBLIC_SITE_URL per environment. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  supportEmail: "support@example.com",

  /** Shown in the footer, legal pages and email footers. */
  company: {
    legalName: "Acme Inc.",
    address: "123 Market Street, San Francisco, CA 94103",
  },

  /** Leave a link empty ("") to hide its icon. */
  social: {
    twitter: "https://x.com",
    github: "https://github.com",
  },

  /**
   * Used in emails, where CSS variables aren't available.
   * Keep it in sync with --primary in globals.css.
   */
  brandColor: "#4f46e5",
} as const;

export type SiteConfig = typeof siteConfig;
