import { PageHeader } from "@/components/shared/page-header";
import { AccountNav } from "@/features/account/components/account-nav";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <>
      <PageHeader title="Account" description="Your personal settings. These apply across all your teams." />
      <AccountNav />
      <div className="max-w-2xl space-y-8">{children}</div>
    </>
  );
}
