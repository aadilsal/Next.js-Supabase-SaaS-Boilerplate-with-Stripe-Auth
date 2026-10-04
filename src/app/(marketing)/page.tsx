import { redirect } from "next/navigation";
import { CtaSection, Faq, FeatureGrid, Hero, Section } from "@/components/marketing/sections";
import { features } from "@/config/features";
import { PricingTable } from "@/features/billing/components/pricing-table";
import { getPriceCatalog } from "@/features/billing/queries";

// Static page, refreshed hourly. The Stripe webhook also refreshes it when prices change.
export const revalidate = 3600;

export default async function LandingPage() {
  // Marketing site switched off in src/config/features.ts: go straight to the app.
  if (!features.marketing) redirect("/dashboard");

  const catalog = features.billing ? await getPriceCatalog() : {};

  return (
    <>
      <Hero />
      <FeatureGrid />
      {features.billing && (
        <Section id="pricing" title="Simple, transparent pricing" subtitle="Start free. Upgrade when you're ready.">
          <PricingTable mode={{ kind: "marketing" }} catalog={catalog} />
        </Section>
      )}
      <Faq />
      <CtaSection />
    </>
  );
}
