import type { PrayerTime, RoundingMode, Synagogue } from "@/types/domain";
import { addMinutes, parseLocalTime } from "@/lib/utils";
import { getDailyZmanimForSynagogue, getRelativeDate, getZmanByKey, roundZman } from "./engine";

export interface ResolvedPrayerTime {
  source: PrayerTime;
  resolvedAt: Date | null;
  label: string;
  displayTime: string;
}

export function resolvePrayerTime(
  prayerTime: PrayerTime,
  synagogue: Synagogue,
  date = new Date(),
  defaultRounding: RoundingMode = "none",
): ResolvedPrayerTime {
  const rounding = prayerTime.rounding ?? defaultRounding;
  let resolvedAt: Date | null = null;

  if (prayerTime.time_mode === "fixed" && prayerTime.fixed_time) {
    resolvedAt = parseLocalTime(date, prayerTime.fixed_time, synagogue.timezone);
  }

  if (prayerTime.time_mode === "relative" && prayerTime.relative_to) {
    const anchorDate = getRelativeDate(date, prayerTime.relative_day);
    const zmanim = getDailyZmanimForSynagogue(synagogue, anchorDate);
    const anchor = getZmanByKey(zmanim, prayerTime.relative_to);
    resolvedAt = anchor ? addMinutes(anchor, prayerTime.offset_minutes) : null;
  }

  return {
    source: prayerTime,
    resolvedAt: resolvedAt ? roundZman(resolvedAt, rounding) : null,
    label: prayerTime.label,
    displayTime: prayerTime.fixed_time ?? "",
  };
}

export function resolvePrayerTimes(
  prayerTimes: PrayerTime[],
  synagogue: Synagogue,
  date = new Date(),
  defaultRounding: RoundingMode = "none",
) {
  return prayerTimes
    .map((prayerTime) => resolvePrayerTime(prayerTime, synagogue, date, defaultRounding))
    .sort((a, b) => (a.resolvedAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.resolvedAt?.getTime() ?? Number.MAX_SAFE_INTEGER));
}
