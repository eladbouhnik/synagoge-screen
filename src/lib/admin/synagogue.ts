import "server-only";

import { demoSynagogue } from "@/lib/demo-data";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Synagogue } from "@/types/domain";

// Resolves the signed-in admin's synagogue. In demo mode (no Supabase env)
// everyone works against the demo synagogue. Returns null when Supabase is
// configured but the request has no authenticated user.
export async function getAdminSynagogue(): Promise<Synagogue | null> {
  if (!hasSupabaseEnv()) return demoSynagogue;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("ensure_owner_synagogue");
  if (error) return null;
  const membership = Array.isArray(data) ? data[0] : data;
  if (!membership?.synagogue_id) return null;

  const { data: synagogue } = await supabase
    .from("synagogues")
    .select("*")
    .eq("id", membership.synagogue_id)
    .single();

  return (synagogue as Synagogue | null) ?? null;
}
