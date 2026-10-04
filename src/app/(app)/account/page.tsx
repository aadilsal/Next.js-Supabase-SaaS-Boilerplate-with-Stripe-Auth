import type { Metadata } from "next";
import { ProfileForm } from "@/features/account/components/profile-form";
import { getProfile, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Profile" };

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await getProfile();

  return <ProfileForm fullName={profile?.full_name ?? ""} email={user.email ?? ""} />;
}
