import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Terms of Service" };

// ⚠️ PLACEHOLDER: replace with terms of service reviewed for your business.
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:leading-7 [&_p]:text-muted-foreground">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p>
        This is placeholder text. Replace it with the terms that govern use of {siteConfig.name}, provided by{" "}
        {siteConfig.company.legalName}.
      </p>
      <h2>Accounts</h2>
      <p>You are responsible for activity on your account and for keeping your credentials secure.</p>
      <h2>Payments</h2>
      <p>Subscriptions renew automatically until canceled. One-time purchases are non-recurring.</p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </article>
  );
}
