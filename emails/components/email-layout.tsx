import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { siteConfig } from "../../src/config/site";

/**
 * Shared layout for every app email: logo, one heading, body, ONE button and
 * a footer. Colors and names come from src/config/site.ts.
 */
export function EmailLayout({
  preview,
  heading,
  children,
  action,
}: {
  preview: string;
  heading: string;
  children: ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={{ ...styles.logo, color: siteConfig.brandColor }}>{siteConfig.name}</Text>
          <Heading style={styles.heading}>{heading}</Heading>
          {children}
          {action && (
            <Section style={styles.buttonSection}>
              <Button href={action.href} style={{ ...styles.button, backgroundColor: siteConfig.brandColor }}>
                {action.label}
              </Button>
              <Text style={styles.muted}>
                Or copy this link into your browser:
                <br />
                <Link href={action.href} style={styles.link}>
                  {action.href}
                </Link>
              </Text>
            </Section>
          )}
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            {siteConfig.company.legalName} · {siteConfig.company.address}
            <br />
            You received this email because of your {siteConfig.name} account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = {
  body: {
    backgroundColor: "#f6f7f9",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "32px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "32px",
  },
  logo: { fontSize: "20px", fontWeight: 700, margin: "0 0 24px" },
  heading: { color: "#111827", fontSize: "22px", fontWeight: 600, margin: "0 0 16px" },
  text: { color: "#374151", fontSize: "15px", lineHeight: "24px", margin: "0 0 16px" },
  buttonSection: { margin: "24px 0 8px" },
  button: {
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 20px",
    textDecoration: "none",
  },
  muted: { color: "#6b7280", fontSize: "13px", lineHeight: "20px", margin: "16px 0 0" },
  link: { color: "#6b7280", wordBreak: "break-all" as const },
  hr: { borderColor: "#e5e7eb", margin: "32px 0 16px" },
  footer: { color: "#9ca3af", fontSize: "12px", lineHeight: "18px", margin: 0 },
};
