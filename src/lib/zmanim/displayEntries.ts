import type { DailyZmanim } from "./engine";

export interface ZmanDisplayEntry {
  key: string;
  label: string;
  value: Date;
}

const zmanLabels: Record<string, string> = {
  sunrise: "זריחה",
  sofZmanShemaGra: "סוף זמן שמע",
  sofZmanTfilaGra: "סוף זמן תפילה",
  chatzot: "חצות",
  minchaGedola: "מנחה גדולה",
  minchaKetana: "מנחה קטנה",
  plagHamincha: "פלג המנחה",
  sunset: "שקיעה",
  tzet: "צאת הכוכבים",
  candleLighting: "הדלקת נרות",
};

// Candle lighting only means anything around Shabbat — hide it the other five days.
export function getZmanDisplayEntries(zmanim: DailyZmanim, now: Date): ZmanDisplayEntry[] {
  const isShabbatWindow = now.getDay() === 5 || now.getDay() === 6;

  return Object.entries(zmanim)
    .filter((entry): entry is [string, Date] => entry[0] in zmanLabels && entry[1] instanceof Date)
    .filter(([key]) => key !== "candleLighting" || isShabbatWindow)
    .map(([key, value]) => ({ key, label: zmanLabels[key], value }));
}
