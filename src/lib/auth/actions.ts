"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
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

// Called only from a real button click (see /auth/confirm/page.tsx), never
// from the bare GET the email link loads. Some mail clients/scanners prefetch
// GET links to prescan them, which silently burns single-use OTP tokens
// before the user's real click — gating verification behind a POST form
// submit avoids that.
export async function confirmEmail(formData: FormData) {
  const next = String(formData.get("next") || "/welcome");

  if (!hasSupabaseEnv()) redirect(next);

  const code = String(formData.get("code") ?? "");
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = formData.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect("/login?error=confirm");
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) redirect("/login?error=confirm");
  } else {
    redirect("/login?error=confirm");
  }

  redirect(next);
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
