import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLog } from "@/types/database";
import { auditEventLabel } from "../lib/events";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function hasMetadata(metadata: AuditLog["metadata"]) {
  return metadata !== null && typeof metadata === "object" && Object.keys(metadata).length > 0;
}

/** Read-only audit log table. Used in team settings, account security and /admin. */
export function AuditLogTable({
  entries,
  showTeam = false,
  emptyMessage = "No activity yet.",
}: {
  entries: AuditLog[];
  showTeam?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">When</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Who</TableHead>
            {showTeam && <TableHead>Team</TableHead>}
            <TableHead>IP address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={showTeam ? 5 : 4} className="py-10 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                {formatDateTime(entry.created_at)}
              </TableCell>
              <TableCell>
                <p className="font-medium">{auditEventLabel(entry.action)}</p>
                {entry.target_id && (
                  <p className="text-xs text-muted-foreground">
                    {entry.target_type}: {entry.target_id}
                  </p>
                )}
                {hasMetadata(entry.metadata) && (
                  <details className="mt-1 text-xs text-muted-foreground">
                    <summary className="cursor-pointer select-none">Details</summary>
                    <pre className="mt-1 max-w-md overflow-x-auto rounded bg-muted p-2 font-mono">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </TableCell>
              <TableCell className="text-sm">{entry.actor_email ?? "System"}</TableCell>
              {showTeam && (
                <TableCell className="font-mono text-xs text-muted-foreground">{entry.team_id ?? "—"}</TableCell>
              )}
              <TableCell className="font-mono text-xs text-muted-foreground">{entry.ip_address ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
