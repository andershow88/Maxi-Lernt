import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getStudents, getInviteCodes } from "@/server/admin-actions";
import { AdminDashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin().catch(() => redirect("/login"));

  const [students, inviteCodes] = await Promise.all([
    getStudents(),
    getInviteCodes(),
  ]);

  return <AdminDashboard students={students} inviteCodes={inviteCodes} />;
}
