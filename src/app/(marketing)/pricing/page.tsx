import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Faq, Section } from "@/components/marketing/sections";
import { features } from "@/config/features";
import { PricingTable } from "@/features/billing/components/pricing-table";
import { getPriceCatalog } from "@/features/billing/queries";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free and upgrade when you're ready.",
};

// Static page, refreshed hourly. The Stripe webhook also refreshes it when prices change.
export const revalidate = 3600;

export default async function PricingPage() {
  if (!features.billing || !features.marketing) notFound();
  const catalog = await getPriceCatalog();

  return (
    <>
      <Section title="Pricing" subtitle="Start free. Upgrade when you're ready. Cancel anytime.">
        <PricingTable mode={{ kind: "marketing" }} catalog={catalog} />
      </Section>
      <Faq />
    </>
  );
}
