import { redirect } from "next/navigation";
import {
  CtaSection,
  Faq,
  FeatureGrid,
  Hero,
  ProofStats,
  Section,
  TechStack,
  Testimonials,
} from "@/components/marketing/sections";
import { features } from "@/config/features";
import { marketingConfig } from "@/config/marketing";
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
      <TechStack />
      <FeatureGrid />
      <ProofStats />
      <Testimonials />
      {features.billing && (
        <Section id="pricing" title={marketingConfig.pricing.title} subtitle={marketingConfig.pricing.subtitle}>
          <PricingTable mode={{ kind: "marketing" }} catalog={catalog} />
        </Section>
      )}
      <Faq />
      <CtaSection />
    </>
  );
}
