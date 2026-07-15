import { getBoardPayload } from "@/lib/data/board";

export async function GET(_request: Request, context: { params: Promise<{ boardKey: string }> }) {
  const { boardKey } = await context.params;
  const payload = await getBoardPayload(boardKey);

  return Response.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
