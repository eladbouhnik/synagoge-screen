import { createDemoBoardPayload } from "@/lib/demo-data";
import { hasSupabaseEnv, createClient } from "@/lib/supabase/server";
import type { BoardPayload, Screen } from "@/types/domain";

const ordered = (screens: Screen[]) => screens.filter((screen) => screen.is_visible).sort((a, b) => a.sort_order - b.sort_order);

export async function getBoardPayload(boardKey: string): Promise<BoardPayload> {
  if (!hasSupabaseEnv()) {
    return createDemoBoardPayload();
  }

  const supabase = await createClient();
  const { data: synagogue, error: synagogueError } = await supabase
    .from("synagogues")
    .select("*")
    .eq("board_key", boardKey)
    .single();

  if (synagogueError || !synagogue) {
    return createDemoBoardPayload();
  }

  const synagogueId = synagogue.id as string;
  const [settings, screens, messages, prayerTimes, iluyNeshama, shiurim, halachot, parnasim, congregants] = await Promise.all([
    supabase.from("board_settings").select("*").eq("synagogue_id", synagogueId).single(),
    supabase.from("screens").select("*").eq("synagogue_id", synagogueId).order("sort_order"),
    supabase.from("messages").select("*").eq("synagogue_id", synagogueId).eq("is_active", true),
    supabase.from("prayer_times").select("*").eq("synagogue_id", synagogueId).order("minyan_number"),
    supabase.from("iluy_neshama").select("*").eq("synagogue_id", synagogueId),
    supabase.from("shiurim").select("*").eq("synagogue_id", synagogueId).eq("is_active", true),
    supabase.from("halachot").select("*").eq("synagogue_id", synagogueId).eq("is_selected", true),
    supabase.from("parnasim").select("*").eq("synagogue_id", synagogueId),
    supabase.from("congregants").select("*").eq("synagogue_id", synagogueId),
  ]);

  if (settings.error || screens.error || messages.error || prayerTimes.error || iluyNeshama.error || shiurim.error || halachot.error || parnasim.error || congregants.error) {
    return createDemoBoardPayload();
  }

  return {
    synagogue: synagogue as BoardPayload["synagogue"],
    settings: settings.data as BoardPayload["settings"],
    screens: ordered((screens.data ?? []) as Screen[]),
    messages: (messages.data ?? []) as BoardPayload["messages"],
    prayerTimes: (prayerTimes.data ?? []) as BoardPayload["prayerTimes"],
    iluyNeshama: (iluyNeshama.data ?? []) as BoardPayload["iluyNeshama"],
    shiurim: (shiurim.data ?? []) as BoardPayload["shiurim"],
    halachot: (halachot.data ?? []) as BoardPayload["halachot"],
    parnasim: (parnasim.data ?? []) as BoardPayload["parnasim"],
    congregants: (congregants.data ?? []) as BoardPayload["congregants"],
    generatedAt: new Date().toISOString(),
  };
}
