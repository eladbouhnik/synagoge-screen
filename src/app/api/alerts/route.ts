import { NextResponse } from "next/server";

const OREF_URL = "https://www.oref.org.il/WarningMessages/alert/alerts.json";

export interface ActiveAlert {
  id: string;
  cat: string;
  title: string;
  data: string[];
  desc: string;
}

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

    if (!response.ok) return NextResponse.json(null);

    const text = await response.text();
    if (!text || text.trim() === "") return NextResponse.json(null);

    const parsed = JSON.parse(text) as ActiveAlert;
    if (!parsed?.data?.length) return NextResponse.json(null);

    return NextResponse.json(parsed, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(null);
  }
}
