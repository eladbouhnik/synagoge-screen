"use server";

import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export interface OwnedSynagogue {
  synagogue_id: string;
  board_key: string;
}

export async function ensureSynagogue(): Promise<OwnedSynagogue | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ensure_owner_synagogue");
  if (error) return null;
  const row = Array.isArray(data) ? (data[0] as OwnedSynagogue | undefined) : (data as OwnedSynagogue | null);
  return row ?? null;
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
