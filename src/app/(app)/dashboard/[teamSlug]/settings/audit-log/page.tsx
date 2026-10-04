import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { observabilityConfig } from "@/config/observability";
import { AuditLogTable } from "@/features/audit/components/audit-log-table";
import { AUDIT_PAGE_SIZE, getTeamAuditLogs } from "@/features/audit/queries";
import { canEditTeam } from "@/features/teams/lib/permissions";
import { requireTeam } from "@/features/teams/queries";

export const metadata: Metadata = { title: "Audit log" };

export default async function TeamAuditLogPage({
  params,
  searchParams,
}: PageProps<"/dashboard/[teamSlug]/settings/audit-log">) {
  const { teamSlug } = await params;
  const { page } = await searchParams;
  const team = await requireTeam(teamSlug);
  // Owners and admins only (RLS enforces the same). 404 rather than 403.
  if (!observabilityConfig.auditLog || !canEditTeam(team.role)) notFound();

  const pageNumber = Math.max(1, Number(page) || 1);
  const { entries, total } = await getTeamAuditLogs(team.id, pageNumber);

  return (
    <>
      <PageHeader title="Audit log" description="Every security and billing event in this team. Entries can't be edited." />
      <AuditLogTable entries={entries} />
      <Pagination page={pageNumber} pageSize={AUDIT_PAGE_SIZE} total={total} />
    </>
  );
}
