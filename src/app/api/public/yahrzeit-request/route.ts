import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { validateYahrzeitRequest, type YahrzeitRequestInput } from "@/lib/yahrzeitRequest";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = (await request.json()) as YahrzeitRequestInput;
  const validated = validateYahrzeitRequest(body);
  if (!validated) return json({ error: "נא למלא את כל שדות החובה" }, 400);

  if (!hasSupabaseEnv()) return json({ ok: true });

  const supabase = await createClient();
  const { data: synagogue, error: synagogueError } = await supabase
    .from("synagogues")
    .select("id")
    .eq("board_key", validated.boardKey)
    .single();

  if (synagogueError || !synagogue) return json({ error: "בית הכנסת לא נמצא" }, 404);

  const { error } = await supabase.from("iluy_neshama").insert({
    id: crypto.randomUUID(),
    synagogue_id: synagogue.id as string,
    deceased_name: validated.deceased_name,
    gender: validated.gender,
    parent_name: validated.parent_name,
    hebrew_death_date: validated.hebrew_death_date,
    donor_name: validated.donor_name,
    submitter_contact: validated.submitter_contact,
    status: "pending",
  });

  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
