import { siteConfig } from "../src/config/site";
import { EmailLayout, Paragraph } from "./components/email-layout";

interface WelcomeEmailProps {
  name?: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Welcome to ${siteConfig.name}! Here's how to get started.`}
      heading={`Welcome to ${siteConfig.name}${name ? `, ${name}` : ""}!`}
      action={{ label: "Open your dashboard", href: dashboardUrl }}
    >
      <Paragraph>
        Thanks for signing up. Your workspace is ready, and you can invite your team and upgrade
        whenever you&apos;re ready.
      </Paragraph>
      <Paragraph>
        Questions? Just reply to this email or write to {siteConfig.supportEmail}.
      </Paragraph>
    </EmailLayout>
  );
}

// Sample data for `pnpm email:dev`.
WelcomeEmail.PreviewProps = {
  name: "Jane",
  dashboardUrl: "http://localhost:3000/dashboard",
} satisfies WelcomeEmailProps;
