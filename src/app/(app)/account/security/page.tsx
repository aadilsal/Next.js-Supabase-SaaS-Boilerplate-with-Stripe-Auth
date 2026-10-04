import type { Metadata } from "next";
import { observabilityConfig } from "@/config/observability";
import { SecuritySettings } from "@/features/account/components/security-settings";
import { AuditLogTable } from "@/features/audit/components/audit-log-table";
import { getMyRecentActivity } from "@/features/audit/queries";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Security" };

export default async function SecurityPage() {
  const user = await requireUser();
  const providers = (user.identities ?? []).map((identity) => identity.provider);
  const activity = observabilityConfig.auditLog ? await getMyRecentActivity(user.id) : [];

  return (
    <>
      <SecuritySettings providers={providers} />
      {observabilityConfig.auditLog && (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <p className="text-sm text-muted-foreground">
              Your last sign-ins and account changes. Don&apos;t recognise something? Change your password and
              sign out everywhere.
            </p>
          </div>
          <AuditLogTable entries={activity} />
        </section>
      )}
    </>
  );
}
