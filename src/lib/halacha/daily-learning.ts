import { formatLocalIsoDate } from "@/lib/utils";

export interface DailyLearningItem {
  category: "dailyRambam1" | "arukhHaShulchanYomi" | "kitzurShulchanAruch";
  title: string;
  source: string;
  link: string | null;
  body: string | null;
}

interface HebcalItem {
  category?: DailyLearningItem["category"];
  title?: string;
  hebrew?: string;
  link?: string;
}

export const sourceLabels: Record<DailyLearningItem["category"], string> = {
  dailyRambam1: "רמב\"ם יומי",
  arukhHaShulchanYomi: "ערוך השולחן יומי",
  kitzurShulchanAruch: "קיצור שולחן ערוך יומי",
};

// The board pins one learning track. If its text failed to resolve (broken ref,
// Sefaria down), fall back to any track that does have text rather than a bare ref.
export function pickDailyLearning(items: DailyLearningItem[], preferred: DailyLearningItem["category"] | null | undefined): DailyLearningItem | undefined {
  const chosen = items.find((item) => item.category === (preferred ?? "kitzurShulchanAruch"));
  if (chosen?.body) return chosen;
  return items.find((item) => item.body) ?? chosen ?? items[0];
}

const supportedCategories = new Set<DailyLearningItem["category"]>(Object.keys(sourceLabels) as DailyLearningItem["category"][]);

export async function getDailyHalacha(date = new Date()): Promise<DailyLearningItem[]> {
  const localDate = formatLocalIsoDate(date, "Asia/Jerusalem");
  const params = new URLSearchParams({
    v: "1",
    cfg: "json",
    i: "on",
    start: localDate,
    end: localDate,
    dr1: "on",
    dksa: "on",
    ahsy: "on",
    lg: "h",
  });

  const response = await fetch(`https://www.hebcal.com/hebcal?${params.toString()}`, {
    next: { revalidate: 21_600 },
  });
  if (!response.ok) throw new Error("Daily learning source is unavailable");

  const data = (await response.json()) as { items?: HebcalItem[] };
  const items = (data.items ?? [])
    .filter((item): item is HebcalItem & { category: DailyLearningItem["category"] } => Boolean(item.category && supportedCategories.has(item.category)))
    .map((item) => ({
      category: item.category,
      title: item.hebrew || item.title || "לימוד יומי",
      source: sourceLabels[item.category],
      link: item.link ?? null,
    }));

  return Promise.all(items.map(async (item) => ({ ...item, body: await fetchSefariaBody(item.link) })));
}

// Hebcal links only carry the daily ref (e.g. "קיצור שולחן ערוך קכג"); the actual
// halacha text lives on Sefaria, addressable by the ref embedded in the link path.
// Sefaria's whole-siman refs (e.g. Kitzur/Arukh HaShulchan) come back as an array of
// se'ifim; the full day's assignment can be 7-9 of them, far more than a board panel
// can show at a readable size. Take only the first few segments — a natural,
// sentence-boundary cut instead of chopping the joined text mid-word — and stop once
// either the segment or character budget is hit.
const targetBodyLength = 320;
const maxSegments = 3;
const maxBodyLength = 900;

async function fetchSefariaBody(link: string | null): Promise<string | null> {
  if (!link) return null;
  let ref: string;
  try {
    const url = new URL(link);
    if (url.hostname !== "www.sefaria.org") return null;
    ref = decodeURIComponent(url.pathname.slice(1));
  } catch {
    return null;
  }
  if (!ref) return null;

  try {
    const response = await fetch(`https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}?context=0&commentary=0`, {
      next: { revalidate: 21_600 },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { he?: unknown; error?: string };
    if (data.error) return null;
    const segments = flattenSegments(data.he).map(cleanSegment).filter(Boolean);
    if (!segments.length) return null;

    const picked: string[] = [];
    let length = 0;
    for (const segment of segments) {
      if (picked.length > 0 && (length >= targetBodyLength || picked.length >= maxSegments)) break;
      picked.push(segment);
      length += segment.length + 1;
    }
    const text = picked.join(" ");
    if (text.length <= maxBodyLength) return text;
    const cut = text.slice(0, maxBodyLength);
    const lastSpace = cut.lastIndexOf(" ");
    return `${lastSpace > maxBodyLength / 2 ? cut.slice(0, lastSpace) : cut}…`;
  } catch {
    return null;
  }
}

function flattenSegments(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flattenSegments);
  return [];
}

function cleanSegment(segment: string): string {
  return segment
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, "")
    .replace(/<i class="footnote">[\s\S]*?<\/i>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
