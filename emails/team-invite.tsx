import { siteConfig } from "../src/config/site";
import { EmailLayout, Paragraph } from "./components/email-layout";

interface TeamInviteEmailProps {
  teamName: string;
  inviterName: string;
  inviteUrl: string;
}

export default function TeamInviteEmail({ teamName, inviterName, inviteUrl }: TeamInviteEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to join ${teamName}`}
      heading={`Join ${teamName} on ${siteConfig.name}`}
      action={{ label: "Accept invitation", href: inviteUrl }}
    >
      <Paragraph>
        {inviterName} has invited you to collaborate in the <strong>{teamName}</strong> team.
      </Paragraph>
      <Paragraph>
        This invitation expires in 7 days. If you weren&apos;t expecting it, you can ignore this email.
      </Paragraph>
    </EmailLayout>
  );
}

TeamInviteEmail.PreviewProps = {
  teamName: "Acme Corp",
  inviterName: "Jane Cooper",
  inviteUrl: "http://localhost:3000/invite/example-token",
} satisfies TeamInviteEmailProps;
