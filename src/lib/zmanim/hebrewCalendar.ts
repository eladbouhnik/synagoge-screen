import { HebrewDateFormatter, JewishCalendar } from "kosher-zmanim";

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
