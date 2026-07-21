import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSynagogue } from "@/lib/admin/synagogue";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const synagogue = await getAdminSynagogue();
  if (!synagogue) redirect("/login");

  return (
    <AdminShell synagogueName={synagogue.name} boardKey={synagogue.board_key} demoMode={!hasSupabaseEnv()}>
      {children}
    </AdminShell>
  );
}
