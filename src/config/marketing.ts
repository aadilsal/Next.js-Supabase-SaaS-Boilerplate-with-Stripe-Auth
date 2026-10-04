import {
  CreditCard,
  LockKeyhole,
  Mail,
  ScrollText,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** Optional photo URL (add the host to next.config images if remote). */
  avatarUrl?: string;
}

/**
 * Landing page copy. Edit the words here; the components in
 * src/components/marketing only handle layout.
 */
export const marketingConfig = {
  hero: {
    eyebrow: "VersaLaunch by TechVersa",
    title: "Launch your SaaS this weekend, not in two months",
    subtitle:
      "VersaLaunch gives you auth, Stripe subscriptions, multi-tenant teams, audit logs and an admin panel, already wired together and secured. Skip weeks of setup and build the part that's actually your product.",
    primaryCta: { label: "Try the live demo", href: "/sign-up" },
    secondaryCta: { label: "See pricing", href: "/pricing" },
  },

  /** "Built with" strip under the hero. Text only, so no logo licensing to worry about. */
  techStack: ["Next.js 16", "TypeScript", "Supabase", "Stripe", "Tailwind CSS", "shadcn/ui", "Resend", "Sentry"],

  /**
   * Verifiable facts about the product. Keep every number true: buyers check.
   * Set to [] to hide the section.
   */
  stats: [
    { value: "3", label: "sign-in methods: password, Google and magic link" },
    { value: "3", label: "pricing models: monthly, yearly and lifetime" },
    { value: "100%", label: "of tables protected by Row Level Security" },
    { value: "0", label: "`any` types. TypeScript strict throughout" },
  ],

  /**
   * Customer quotes. The section stays hidden while this is empty.
   * Only add REAL quotes from real customers, with their permission.
   */
  testimonials: [] as Testimonial[],

  features: {
    title: "Everything a SaaS needs on day one",
    subtitle: "Production-ready building blocks you'd otherwise spend weeks building and securing.",
    items: [
      {
        icon: LockKeyhole,
        title: "Authentication",
        description: "Email + password, Google sign-in and magic links, with secure server-verified sessions.",
      },
      {
        icon: CreditCard,
        title: "Stripe billing",
        description:
          "Monthly, yearly and lifetime plans, a customer portal, idempotent webhooks and a live price catalog.",
      },
      {
        icon: Users,
        title: "B2B teams & roles",
        description: "Multi-tenant from day one: invite teammates and manage owners, admins and members.",
      },
      {
        icon: ShieldCheck,
        title: "Row Level Security",
        description: "Every table is protected in Postgres and covered by tests, so tenants never see each other's data.",
      },
      {
        icon: ScrollText,
        title: "Audit logs & monitoring",
        description: "Tamper-proof audit trail, structured logs stored in your database, and Sentry error tracking.",
      },
      {
        icon: Mail,
        title: "Transactional email",
        description: "Branded welcome, invite and password reset emails built with React Email and Resend.",
      },
    ] satisfies { icon: LucideIcon; title: string; description: string }[],
  },

  pricing: {
    title: "Simple, transparent pricing",
    subtitle: "This is VersaLaunch's billing system running live. Plans check out through Stripe test mode.",
  },

  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "What exactly do I get?",
        answer:
          "The full source code of a working SaaS: auth, Stripe billing, teams, emails, admin panel, audit logs, database migrations with security tests, and step-by-step docs.",
      },
      {
        question: "Can I use it for client projects?",
        answer: "Yes. One license covers unlimited personal and commercial projects.",
      },
      {
        question: "How hard is it to rebrand?",
        answer:
          "Your name, colors, plans and landing page copy live in a handful of config files. Most people rebrand in under an hour.",
      },
      {
        question: "Is it secure?",
        answer:
          "Tenant data is isolated with Postgres Row Level Security, payments run entirely on Stripe-hosted pages, and every sensitive action is written to an append-only audit log.",
      },
      {
        question: "Do I need to use teams and billing?",
        answer: "No. Switch either off in one config file and the app adapts. It works for B2C and B2B products.",
      },
    ],
  },

  cta: {
    title: "Ready to ship your SaaS?",
    subtitle: "Create a demo account in seconds and explore everything VersaLaunch includes.",
    button: { label: "Try the live demo", href: "/sign-up" },
  },

  /** Header links (in addition to Sign in / Get started). */
  headerLinks: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/#faq" },
  ],

  footerLinks: [
    { label: "Pricing", href: "/pricing" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
