import {
  CreditCard,
  LockKeyhole,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Landing page copy. Edit the words here; the components in
 * src/components/marketing only handle layout.
 */
export const marketingConfig = {
  hero: {
    eyebrow: "Next.js + Supabase + Stripe",
    title: "Launch your SaaS this weekend, not in two months",
    subtitle:
      "Auth, subscriptions, teams, emails and an admin panel, already wired together. Skip weeks of setup and start building the part that's actually your product.",
    primaryCta: { label: "Get started free", href: "/sign-up" },
    secondaryCta: { label: "View pricing", href: "/pricing" },
  },

  features: {
    title: "Everything a SaaS needs on day one",
    subtitle: "Production-ready building blocks you'd otherwise spend weeks on.",
    items: [
      {
        icon: LockKeyhole,
        title: "Authentication",
        description: "Email + password, Google sign-in and magic links, with secure cookie sessions.",
      },
      {
        icon: CreditCard,
        title: "Stripe billing",
        description: "Monthly, yearly and lifetime pricing with hosted Checkout and a customer portal.",
      },
      {
        icon: Users,
        title: "Teams & roles",
        description: "Invite teammates by email and manage owners, admins and members.",
      },
      {
        icon: ShieldCheck,
        title: "Row Level Security",
        description: "Every table is protected in Postgres, so tenants can never see each other's data.",
      },
      {
        icon: Mail,
        title: "Transactional email",
        description: "Branded welcome, invite and password reset emails built with React Email.",
      },
      {
        icon: SlidersHorizontal,
        title: "Admin panel",
        description: "See every user and team on the platform, and ban abusive accounts.",
      },
    ] satisfies { icon: LucideIcon; title: string; description: string }[],
  },

  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Can I cancel anytime?",
        answer: "Yes. Manage or cancel your subscription from the billing page at any time.",
      },
      {
        question: "Do you offer a free plan?",
        answer: "Yes. The Free plan is free forever. Upgrade when you need more.",
      },
      {
        question: "What does the Lifetime plan include?",
        answer: "Everything in Pro, paid once. No recurring charges.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Data is isolated per team with Postgres Row Level Security, and payments are handled entirely by Stripe.",
      },
    ],
  },

  cta: {
    title: "Ready to ship?",
    subtitle: "Create your account in seconds. No credit card required.",
    button: { label: "Start for free", href: "/sign-up" },
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
