import { Building2, CreditCard, Infinity as InfinityIcon, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/features/admin/queries";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();
  const cards = [
    { label: "Users", value: stats.users, icon: Users },
    { label: "Teams", value: stats.teams, icon: Building2 },
    { label: "Active subscriptions", value: stats.activeSubscriptions, icon: CreditCard },
    { label: "Lifetime purchases", value: stats.lifetimePurchases, icon: InfinityIcon },
  ];

  return (
    <>
      <PageHeader title="Overview" description="Platform-wide numbers across every tenant." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden />
                {label}
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">{value.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}
