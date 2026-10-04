import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/badges";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/shared/pagination";
import { AdminSearch } from "@/features/admin/components/admin-table-controls";
import { BanUserButton } from "@/features/admin/components/ban-user-button";
import { ADMIN_PAGE_SIZE, listUsers } from "@/features/admin/queries";
import { requirePlatformAdmin } from "@/lib/auth";

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString() : "Never";
}

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const { user: currentUser } = await requirePlatformAdmin();
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const pageNumber = Math.max(1, Number(page) || 1);
  const { users, total } = await listUsers({ query, page: pageNumber });

  return (
    <>
      <PageHeader title="Users" description={`${total.toLocaleString()} total`} />
      <AdminSearch placeholder="Search by email…" defaultValue={query} />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last sign-in</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.full_name} email={user.email} src={user.avatar_url} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.full_name ?? user.email}</p>
                      {user.full_name && <p className="truncate text-sm text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>{formatDate(user.lastSignInAt)}</TableCell>
                <TableCell className="space-x-1">
                  {user.is_platform_admin && <Badge>Admin</Badge>}
                  {user.isBanned && <StatusBadge status="banned" />}
                </TableCell>
                <TableCell>
                  {user.id !== currentUser.id && <BanUserButton userId={user.id} email={user.email} isBanned={user.isBanned} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination page={pageNumber} pageSize={ADMIN_PAGE_SIZE} total={total} params={{ q: query }} />
    </>
  );
}
