import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { marketingConfig } from "@/config/marketing";

/**
 * Landing page sections. The copy lives in src/config/marketing.ts; edit the
 * words there and the layout here.
 */

export function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {title && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
            {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Hero() {
  const { hero } = marketingConfig;
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[28rem] max-w-4xl rounded-full bg-primary/15 blur-3xl"
      />
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-32">
        <Badge variant="outline" className="mb-6">
          {hero.eyebrow}
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {hero.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-balance text-muted-foreground">{hero.subtitle}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  const { features } = marketingConfig;
  return (
    <Section id="features" title={features.title} subtitle={features.subtitle}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.items.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-5 text-primary" aria-hidden />
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Faq() {
  const { faq } = marketingConfig;
  return (
    <Section id="faq" title={faq.title}>
      <Accordion type="single" collapsible className="mx-auto max-w-2xl">
        {faq.items.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

export function CtaSection() {
  const { cta } = marketingConfig;
  return (
    <section className="px-4 pb-16 sm:px-6 md:pb-24">
      <div className="mx-auto max-w-5xl rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{cta.title}</h2>
        <p className="mt-4 text-lg opacity-90">{cta.subtitle}</p>
        <Button size="lg" variant="secondary" className="mt-8" asChild>
          <Link href={cta.button.href}>{cta.button.label}</Link>
        </Button>
      </div>
    </section>
  );
}
