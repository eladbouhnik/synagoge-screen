import { createDemoBoardPayload } from "@/lib/demo-data";
import { adminResources, isAdminResourceKey } from "@/lib/admin/resources";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

type RowPayload = Record<string, unknown> & { id?: string };

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function getSynagogueId() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  await supabase.rpc("claim_synagogue_invitations");

  const { data } = await supabase
    .from("admin_users")
    .select("synagogue_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .single();

  return data?.synagogue_id as string | null;
}

export async function GET(_request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  if (!isAdminResourceKey(resource)) return json({ error: "Unknown resource" }, 404);

  const config = adminResources[resource];
  if (!hasSupabaseEnv()) return json({ rows: config.demoRows });

  const synagogueId = await getSynagogueId();
  if (!synagogueId) return json({ error: "Unauthorized" }, 401);

  const supabase = await createClient();
  let query = supabase.from(config.table).select("*");
  if (config.table === "synagogues") query = query.eq("id", synagogueId);
  else query = query.eq("synagogue_id", synagogueId);
  if (config.orderBy) query = query.order(config.orderBy);

  const { data, error } = await query;
  if (error) return json({ error: error.message }, 400);
  return json({ rows: data ?? [] });
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  if (!isAdminResourceKey(resource)) return json({ error: "Unknown resource" }, 404);
  if (!hasSupabaseEnv()) return json({ rows: createDemoBoardPayload() });

  const synagogueId = await getSynagogueId();
  if (!synagogueId) return json({ error: "Unauthorized" }, 401);

  const config = adminResources[resource];
  const body = (await request.json()) as RowPayload;
  const payload = config.table === "synagogues"
    ? { ...body, id: synagogueId }
    : { ...body, id: body.id ?? crypto.randomUUID(), synagogue_id: synagogueId };
  const supabase = await createClient();
  const { data, error } = await supabase.from(config.table).upsert(payload).select("*").single();

  if (error) return json({ error: error.message }, 400);
  return json({ row: data });
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  if (!isAdminResourceKey(resource)) return json({ error: "Unknown resource" }, 404);
  if (!hasSupabaseEnv()) return json({ ok: true });

  const { id } = (await request.json()) as { id?: string };
  if (!id) return json({ error: "Missing id" }, 400);

  const synagogueId = await getSynagogueId();
  if (!synagogueId) return json({ error: "Unauthorized" }, 401);

  const config = adminResources[resource];
  if (config.singleton) return json({ error: "Singleton resources cannot be deleted" }, 400);

  const supabase = await createClient();
  const { error } = await supabase.from(config.table).delete().eq("id", id).eq("synagogue_id", synagogueId);
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
