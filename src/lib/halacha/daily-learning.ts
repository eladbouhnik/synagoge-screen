import { formatLocalIsoDate } from "@/lib/utils";

export interface DailyLearningItem {
  category: "dailyRambam1" | "arukhHaShulchanYomi" | "kitzurShulchanAruch";
  title: string;
  source: string;
  link: string | null;
}

interface HebcalItem {
  category?: DailyLearningItem["category"];
  title?: string;
  hebrew?: string;
  link?: string;
}

const sourceLabels: Record<DailyLearningItem["category"], string> = {
  dailyRambam1: "רמב\"ם יומי",
  arukhHaShulchanYomi: "ערוך השולחן יומי",
  kitzurShulchanAruch: "קיצור שולחן ערוך יומי",
};

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
  return (data.items ?? [])
    .filter((item): item is HebcalItem & { category: DailyLearningItem["category"] } => Boolean(item.category && supportedCategories.has(item.category)))
    .map((item) => ({
      category: item.category,
      title: item.hebrew || item.title || "לימוד יומי",
      source: sourceLabels[item.category],
      link: item.link ?? null,
    }));
}
