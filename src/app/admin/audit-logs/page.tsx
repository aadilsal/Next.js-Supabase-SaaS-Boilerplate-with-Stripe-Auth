import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { AdminSearch } from "@/features/admin/components/admin-table-controls";
import { AuditLogTable } from "@/features/audit/components/audit-log-table";
import { AUDIT_PAGE_SIZE, listAllAuditLogs } from "@/features/audit/queries";

export default async function AdminAuditLogsPage({ searchParams }: PageProps<"/admin/audit-logs">) {
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const pageNumber = Math.max(1, Number(page) || 1);
  const { entries, total } = await listAllAuditLogs({ query, page: pageNumber });

  return (
    <>
      <PageHeader title="Audit log" description={`${total.toLocaleString()} events across all teams`} />
      <AdminSearch placeholder="Search by email or event…" defaultValue={query} />
      <AuditLogTable entries={entries} showTeam emptyMessage="No events found." />
      <Pagination page={pageNumber} pageSize={AUDIT_PAGE_SIZE} total={total} params={{ q: query }} />
    </>
  );
}
