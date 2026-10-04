import AdminUsersTable from "@/components/modules/admin/users-table";
import { PageHeading } from "@/components/shared/page-heading";

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeading
        title="User management"
        description="Search, filter, promote and block accounts. Every change is written to the audit log."
      />
      <AdminUsersTable />
    </div>
  );
}
