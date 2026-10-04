import { redirect } from "next/navigation";
import { CtaSection, Faq, FeatureGrid, Hero, Section } from "@/components/marketing/sections";
import { features } from "@/config/features";
import { PricingTable } from "@/features/billing/components/pricing-table";

export default function LandingPage() {
  // Marketing site switched off in src/config/features.ts: go straight to the app.
  if (!features.marketing) redirect("/dashboard");

  return (
    <>
      <Hero />
      <FeatureGrid />
      {features.billing && (
        <Section id="pricing" title="Simple, transparent pricing" subtitle="Start free. Upgrade when you're ready.">
          <PricingTable mode={{ kind: "marketing" }} />
        </Section>
      )}
      <Faq />
      <CtaSection />
    </>
  );
}
