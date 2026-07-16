import { describe, expect, it } from "vitest";
import { demoPrayerTimes, demoSynagogue } from "@/lib/demo-data";
import { getDailyZmanimForSynagogue, getRelativeDate, roundZman } from "@/lib/zmanim/engine";
import { resolvePrayerTime } from "@/lib/zmanim/resolvePrayerTime";
import { matchesSchedule } from "@/lib/schedule/rules";

describe("zmanim engine", () => {
  it("calculates stable daily zmanim for Safed", () => {
    const zmanim = getDailyZmanimForSynagogue(demoSynagogue, new Date("2026-07-16T12:00:00.000Z"));

    expect(zmanim.sunrise?.toISOString()).toMatch(/^2026-07-16T02:35:/);
    expect(zmanim.sunset?.toISOString()).toMatch(/^2026-07-16T16:52:/);
    expect(zmanim.candleLighting?.toISOString()).toMatch(/^2026-07-16T16:12:/);
    expect(zmanim.plagHamincha).toBeInstanceOf(Date);
  });

  it("rounds zmanim by configured strategy", () => {
    const date = new Date("2026-07-16T10:12:30.000Z");

    expect(roundZman(date, "up5").toISOString()).toBe("2026-07-16T10:15:00.000Z");
    expect(roundZman(date, "down5").toISOString()).toBe("2026-07-16T10:10:00.000Z");
    expect(roundZman(date, "nearest5").toISOString()).toBe("2026-07-16T10:10:00.000Z");
  });

  it("anchors weekly relative prayer times to the requested weekday", () => {
    const thursday = new Date("2026-07-16T12:00:00.000Z");
    const tuesdayAnchor = getRelativeDate(thursday, "tuesday");

    expect(tuesdayAnchor.toISOString().slice(0, 10)).toBe("2026-07-14");
  });

  it("resolves fixed and relative prayer times", () => {
    const date = new Date("2026-07-16T12:00:00.000Z");
    const fixed = resolvePrayerTime(demoPrayerTimes[1]!, demoSynagogue, date, "none");
    const relative = resolvePrayerTime(demoPrayerTimes[2]!, demoSynagogue, date, "nearest5");

    expect(fixed.resolvedAt?.toISOString()).toBe("2026-07-16T04:15:00.000Z");
    expect(relative.resolvedAt).toBeInstanceOf(Date);
    expect(relative.resolvedAt!.getUTCMinutes() % 5).toBe(0);
  });

  it("applies weekday, Shabbat, and date-range schedule rules", () => {
    const thursday = new Date("2026-07-16T12:00:00.000Z");
    const shabbat = new Date("2026-07-18T12:00:00.000Z");

    expect(matchesSchedule(demoPrayerTimes[0]!, thursday, demoSynagogue.timezone)).toBe(true);
    expect(matchesSchedule(demoPrayerTimes[0]!, shabbat, demoSynagogue.timezone)).toBe(false);
    expect(matchesSchedule(demoPrayerTimes[4]!, shabbat, demoSynagogue.timezone)).toBe(false);
    expect(matchesSchedule({ ...demoPrayerTimes[0]!, end_date: "2026-07-15" }, thursday, demoSynagogue.timezone)).toBe(false);
  });
});
