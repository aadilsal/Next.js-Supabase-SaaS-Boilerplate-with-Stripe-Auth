import { PlanBadge } from "@/components/shared/badges";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/shared/pagination";
import { AdminSearch } from "@/features/admin/components/admin-table-controls";
import { ADMIN_PAGE_SIZE, listTeams } from "@/features/admin/queries";

export default async function AdminTeamsPage({ searchParams }: PageProps<"/admin/teams">) {
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const pageNumber = Math.max(1, Number(page) || 1);
  const { teams, total } = await listTeams({ query, page: pageNumber });

  return (
    <>
      <PageHeader title="Teams" description={`${total.toLocaleString()} total, including personal workspaces`} />
      <AdminSearch placeholder="Search by team name…" defaultValue={query} />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No teams found.
                </TableCell>
              </TableRow>
            )}
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <p className="font-medium">
                    {team.name}
                    {team.isPersonal && (
                      <Badge variant="secondary" className="ml-2">
                        Personal
                      </Badge>
                    )}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{team.slug}</p>
                </TableCell>
                <TableCell className="tabular-nums">{team.memberCount}</TableCell>
                <TableCell>
                  <PlanBadge name={team.plan} />
                </TableCell>
                <TableCell>{new Date(team.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination page={pageNumber} pageSize={ADMIN_PAGE_SIZE} total={total} params={{ q: query }} />
    </>
  );
}
