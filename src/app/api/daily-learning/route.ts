import { getDailyHalacha } from "@/lib/halacha/daily-learning";

export async function GET() {
  try {
    return Response.json({ items: await getDailyHalacha() }, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
