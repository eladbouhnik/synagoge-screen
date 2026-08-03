import { HebrewDateFormatter, JewishCalendar, JewishDate } from "kosher-zmanim";

const formatter = new HebrewDateFormatter();
formatter.setHebrewFormat(true);

export interface HebrewCalendarSummary {
  hebrewDate: string;
  parsha: string | null;
  yomTov: string | null;
  isRoshChodesh: boolean;
}

export function getHebrewCalendarSummary(date = new Date(), inIsrael = true): HebrewCalendarSummary {
  const calendar = new JewishCalendar(date);
  calendar.setInIsrael(inIsrael);
  calendar.setUseModernHolidays(true);

  const parsha = formatter.formatParsha(calendar);
  const yomTov = formatter.formatYomTov(calendar);

  return {
    hebrewDate: formatter.format(calendar),
    parsha: parsha || null,
    yomTov: yomTov || null,
    isRoshChodesh: calendar.isRoshChodesh(),
  };
}

export interface JewishDateParts {
  year: number;
  month: number;
  day: number;
}

/** Gregorian date -> {year, month, day} in the Jewish calendar (month: 1=Nissan ... 12/13=Adar/Adar II). */
export function getJewishDateParts(date = new Date()): JewishDateParts {
  const jewishDate = new JewishDate(date);
  return {
    year: jewishDate.getJewishYear(),
    month: jewishDate.getJewishMonth(),
    day: jewishDate.getJewishDayOfMonth(),
  };
}

export interface HebrewMonthOption {
  value: number;
  label: string;
}

/** Jewish months for a given year, in calendar order (Tishrei first), with Hebrew labels. */
export function getHebrewMonthsForYear(year: number): HebrewMonthOption[] {
  const isLeap = new JewishDate(year, JewishDate.TISHREI, 1).isJewishLeapYear();
  const order = [
    JewishDate.TISHREI,
    JewishDate.CHESHVAN,
    JewishDate.KISLEV,
    JewishDate.TEVES,
    JewishDate.SHEVAT,
    JewishDate.ADAR,
    ...(isLeap ? [JewishDate.ADAR_II] : []),
    JewishDate.NISSAN,
    JewishDate.IYAR,
    JewishDate.SIVAN,
    JewishDate.TAMMUZ,
    JewishDate.AV,
    JewishDate.ELUL,
  ];
  return order.map((month) => ({
    value: month,
    label: formatter.formatMonth(new JewishDate(year, month, 1)),
  }));
}

export function getDaysInHebrewMonth(year: number, month: number): number {
  return new JewishDate(year, month, 1).getDaysInJewishMonth();
}

/** Jewish {year, month, day} -> a formatted Hebrew date string (e.g. "י״ב תמוז תשפ״ד"). */
export function formatHebrewDate(year: number, month: number, day: number): string {
  return formatter.format(new JewishDate(year, month, day));
}

/** Jewish {year, month, day} -> the matching Gregorian calendar date, as {year, month (1-based), day}. */
export function hebrewToGregorianParts(year: number, month: number, day: number): JewishDateParts {
  const jewishDate = new JewishDate(year, month, day);
  return {
    year: jewishDate.getGregorianYear(),
    month: jewishDate.getGregorianMonth() + 1,
    day: jewishDate.getGregorianDayOfMonth(),
  };
}
