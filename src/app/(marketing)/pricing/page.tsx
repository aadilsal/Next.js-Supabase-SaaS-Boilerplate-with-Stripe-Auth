import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Faq, Section } from "@/components/marketing/sections";
import { features } from "@/config/features";
import { PricingTable } from "@/features/billing/components/pricing-table";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free and upgrade when you're ready.",
};

export default function PricingPage() {
  if (!features.billing || !features.marketing) notFound();

  return (
    <>
      <Section title="Pricing" subtitle="Start free. Upgrade when you're ready. Cancel anytime.">
        <PricingTable mode={{ kind: "marketing" }} />
      </Section>
      <Faq />
    </>
  );
}
