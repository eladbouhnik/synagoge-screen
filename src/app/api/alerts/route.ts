import { NextResponse } from "next/server";
import { parseActiveAlertText, type ActiveAlert } from "@/lib/alerts";

const OREF_URL = "https://www.oref.org.il/WarningMessages/alert/alerts.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch(OREF_URL, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://www.oref.org.il/",
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });

    if (!response.ok) return jsonNoStore(null, 502);

    const text = await response.text();
    const parsed = parseActiveAlertText(text);
    if (!parsed) return jsonNoStore(null);

    return jsonNoStore(parsed);
  } catch {
    return jsonNoStore(null, 502);
  }
}

function jsonNoStore(body: ActiveAlert | null, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
  });
}
