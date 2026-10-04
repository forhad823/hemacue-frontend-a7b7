import type { Metadata } from "next";
import AuditLogsTable from "@/components/modules/admin/audit-logs-table";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Audit Logs — Admin",
  description:
    "Append-only trail of role changes, status transitions, donations and payments.",
};

export default function AuditLogsPage() {
  return (
    <div>
      <PageHeading
        title="Audit logs"
        description="Who did what, on which record, and from where. Nothing here can be edited or removed."
      />
      <AuditLogsTable />
    </div>
  );
}
