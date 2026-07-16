import { HebrewDateFormatter, JewishCalendar } from "kosher-zmanim";
import type { DayType, RelativeDay } from "@/types/domain";
import { formatLocalIsoDate } from "@/lib/utils";

interface ScheduledEntry {
  day_type: DayType;
  days?: RelativeDay[];
  start_date?: string | null;
  end_date?: string | null;
  holiday_tags?: string[];
  is_active?: boolean;
}

const weekdayNames: RelativeDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "shabbat"];
const formatter = new HebrewDateFormatter();
formatter.setHebrewFormat(true);

export function getDayType(date = new Date()): DayType {
  const calendar = new JewishCalendar(date);
  calendar.setInIsrael(true);
  if (calendar.getYomTovIndex() > 0) return "holiday";
  return date.getDay() === 6 ? "shabbat" : "weekday";
}

export function getHolidayTag(date = new Date()) {
  const calendar = new JewishCalendar(date);
  calendar.setInIsrael(true);
  return calendar.getYomTovIndex() > 0 ? formatter.formatYomTov(calendar) || null : null;
}

export function matchesSchedule(entry: ScheduledEntry, date = new Date(), timeZone = "Asia/Jerusalem") {
  if (entry.is_active === false) return false;

  const today = formatLocalIsoDate(date, timeZone);
  if (entry.start_date && entry.start_date > today) return false;
  if (entry.end_date && entry.end_date < today) return false;

  const dayType = getDayType(date);
  const isFriday = date.getDay() === 5;
  if (entry.day_type === "weekday" && dayType !== "weekday") return false;
  if (entry.day_type === "shabbat" && dayType !== "shabbat" && !isFriday) return false;
  if (entry.day_type === "holiday" && dayType !== "holiday") return false;

  const currentDay = weekdayNames[date.getDay()];
  if (entry.days?.length && !entry.days.includes(currentDay)) return false;

  if (entry.holiday_tags?.length) {
    const holidayTag = getHolidayTag(date);
    if (!holidayTag || !entry.holiday_tags.includes(holidayTag)) return false;
  }

  return true;
}
