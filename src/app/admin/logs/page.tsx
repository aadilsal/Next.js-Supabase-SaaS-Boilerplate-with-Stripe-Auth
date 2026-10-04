import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AUDIT_PAGE_SIZE, listAppLogs } from "@/features/audit/queries";

const LEVEL_FILTERS = [
  { label: "All", value: undefined },
  { label: "Errors", value: "error" },
  { label: "Warnings", value: "warn" },
];

function errorMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return null;
}

/** Warnings and errors written by src/lib/logger.ts. */
export default async function AdminLogsPage({ searchParams }: PageProps<"/admin/logs">) {
  const { level, page } = await searchParams;
  const levelFilter = level === "error" || level === "warn" ? level : undefined;
  const pageNumber = Math.max(1, Number(page) || 1);
  const { entries, total } = await listAppLogs({ level: levelFilter, page: pageNumber });

  return (
    <>
      <PageHeader
        title="Application logs"
        description="Warnings and errors from the server. Errors are also sent to Sentry when it's configured."
      />
      <div className="flex gap-2">
        {LEVEL_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            size="sm"
            variant={levelFilter === filter.value ? "default" : "outline"}
            asChild
          >
            <Link href={filter.value ? `/admin/logs?level=${filter.value}` : "/admin/logs"}>{filter.label}</Link>
          </Button>
        ))}
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">When</TableHead>
              <TableHead className="w-24">Level</TableHead>
              <TableHead>Event</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  Nothing logged. That&apos;s good news.
                </TableCell>
              </TableRow>
            )}
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="align-top text-sm whitespace-nowrap text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant={entry.level === "error" ? "destructive" : "secondary"}>{entry.level}</Badge>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-sm">{entry.event}</p>
                  {(entry.message || errorMessage(entry.error)) && (
                    <p className="text-sm text-muted-foreground">{entry.message ?? errorMessage(entry.error)}</p>
                  )}
                  <details className="mt-1 text-xs text-muted-foreground">
                    <summary className="cursor-pointer select-none">Details</summary>
                    <pre className="mt-1 max-w-2xl overflow-x-auto rounded bg-muted p-2 font-mono">
                      {JSON.stringify(
                        { context: entry.context, error: entry.error, userId: entry.user_id, teamId: entry.team_id },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination page={pageNumber} pageSize={AUDIT_PAGE_SIZE} total={total} params={{ level: levelFilter }} />
    </>
  );
}
