import type { PrayerTime, RoundingMode, Synagogue, ZmanimOpinions } from "@/types/domain";
import { addMinutes, parseLocalTime } from "@/lib/utils";
import { getDailyZmanimForSynagogue, getZmanByKey, roundZman } from "./engine";
import { matchesSchedule } from "@/lib/schedule/rules";

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
  opinions?: ZmanimOpinions,
): ResolvedPrayerTime {
  const rounding = prayerTime.rounding ?? defaultRounding;
  let resolvedAt: Date | null = null;

  if (prayerTime.time_mode === "fixed" && prayerTime.fixed_time) {
    resolvedAt = parseLocalTime(date, prayerTime.fixed_time, synagogue.timezone);
  }

  if (prayerTime.time_mode === "relative" && prayerTime.relative_to) {
    const zmanim = getDailyZmanimForSynagogue(synagogue, date, opinions);
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
  opinions?: ZmanimOpinions,
) {
  return prayerTimes
    .filter((prayerTime) => matchesSchedule(prayerTime, date, synagogue.timezone))
    .map((prayerTime) => resolvePrayerTime(prayerTime, synagogue, date, defaultRounding, opinions))
    .sort((a, b) => (a.resolvedAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.resolvedAt?.getTime() ?? Number.MAX_SAFE_INTEGER));
}
