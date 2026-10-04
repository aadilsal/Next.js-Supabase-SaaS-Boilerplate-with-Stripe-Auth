import type { Metadata } from "next";
import { SecuritySettings } from "@/features/account/components/security-settings";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Security" };

export default async function SecurityPage() {
  const user = await requireUser();
  const providers = (user.identities ?? []).map((identity) => identity.provider);

  return <SecuritySettings providers={providers} />;
}
