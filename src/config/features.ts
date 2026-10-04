/**
 * Feature switches. Turn whole areas of the product on or off without
 * deleting code. Everything here is read on the server and in the UI.
 */
export const features = {
  auth: {
    /** Email + password sign-in and sign-up. */
    password: true,
    /** Passwordless "email me a link" sign-in. */
    magicLink: true,
    /** "Continue with Google". Also enable the provider in Supabase. */
    google: true,
  },

  teams: {
    /**
     * Multi-tenant team features: team switcher, members page, invitations.
     * When false, every user just has their personal workspace.
     */
    enabled: true,
    /** Let users create additional teams. */
    allowCreate: true,
  },

  /**
   * Stripe billing UI. Also requires STRIPE_SECRET_KEY to be set; without it,
   * billing pages explain how to finish the setup instead of crashing.
   */
  billing: true,

  /** Platform admin panel at /admin (only visible to platform admins). */
  admin: true,

  /** Public landing + pricing pages. When false, "/" sends people to the app. */
  marketing: true,

  /** Send a welcome email after a user's first sign-in. */
  welcomeEmail: true,

  /** Light / dark / system theme switcher. */
  themeToggle: true,
} as const;

export type Features = typeof features;
