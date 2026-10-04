import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Privacy Policy" };

// ⚠️ PLACEHOLDER: replace with a privacy policy reviewed for your business.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:leading-7 [&_p]:text-muted-foreground">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p>
        This is placeholder text. Replace it with a privacy policy that describes how{" "}
        {siteConfig.company.legalName} collects, uses and protects personal data.
      </p>
      <h2>Information we collect</h2>
      <p>Account details (name, email), team membership and billing status. Payments are processed by Stripe.</p>
      <h2>How we use it</h2>
      <p>To provide and improve {siteConfig.name}, send transactional emails and prevent abuse.</p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </article>
  );
}
