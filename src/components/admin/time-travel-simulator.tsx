"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Rewind, FastForward } from "lucide-react";
import type { BoardPayload } from "@/types/domain";
import { BoardShell } from "@/components/board/board-shell";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import {
  addMinutes,
  formatGregorianDate,
  formatLocalIsoDate,
  formatLocalIsoTime,
  formatTime,
  formatWeekday,
  zonedTimeToUtc,
} from "@/lib/utils";
import {
  getDaysInHebrewMonth,
  getHebrewCalendarSummary,
  getHebrewMonthsForYear,
  getJewishDateParts,
  hebrewToGregorianParts,
} from "@/lib/zmanim/hebrewCalendar";

const speedOptions = [
  { value: 1, label: "זמן אמת" },
  { value: 60, label: "דקה לשנייה" },
  { value: 3600, label: "שעה לשנייה" },
  { value: 86_400, label: "יום לשנייה" },
];

interface TimeTravelSimulatorProps {
  boardKey: string;
  initialPayload: BoardPayload;
  timezone: string;
}

export function TimeTravelSimulator({ boardKey, initialPayload, timezone }: TimeTravelSimulatorProps) {
  const [simNow, setSimNow] = useState(() => new Date());
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSimNow((current) => new Date(current.getTime() + speed * 1000));
      setTick((count) => count + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const setSimNowAndCount = (next: Date) => {
    setSimNow(next);
    setTick((count) => count + 1);
  };

  const step = (minutes: number) => setSimNowAndCount(addMinutes(simNow, minutes));

  const resetToNow = () => {
    setPlaying(false);
    setSimNowAndCount(new Date());
  };

  const gregorianDateValue = formatLocalIsoDate(simNow, timezone);
  const timeValue = formatLocalIsoTime(simNow, timezone);

  const jewish = useMemo(() => getJewishDateParts(simNow), [simNow]);
  const hebrewMonths = useMemo(() => getHebrewMonthsForYear(jewish.year), [jewish.year]);
  const daysInMonth = useMemo(() => getDaysInHebrewMonth(jewish.year, jewish.month), [jewish.year, jewish.month]);
  const summary = useMemo(() => getHebrewCalendarSummary(simNow), [simNow]);

  const applyTimeString = (nextTimeValue: string) => {
    setSimNowAndCount(zonedTimeToUtc(gregorianDateValue, nextTimeValue, timezone));
  };

  const applyGregorianDate = (nextDateValue: string) => {
    setSimNowAndCount(zonedTimeToUtc(nextDateValue, timeValue, timezone));
  };

  const applyHebrewDate = (next: { year?: number; month?: number; day?: number }) => {
    const year = next.year ?? jewish.year;
    const month = next.month ?? jewish.month;
    const maxDay = getDaysInHebrewMonth(year, month);
    const day = Math.min(next.day ?? jewish.day, maxDay);
    const gregorian = hebrewToGregorianParts(year, month, day);
    const dateStr = `${gregorian.year.toString().padStart(4, "0")}-${gregorian.month.toString().padStart(2, "0")}-${gregorian.day.toString().padStart(2, "0")}`;
    setSimNowAndCount(zonedTimeToUtc(dateStr, timeValue, timezone));
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-lg font-black">{formatWeekday(simNow, timezone)} · {formatGregorianDate(simNow, timezone)}</p>
            <p className="text-sm font-bold text-muted-foreground">
              {summary.hebrewDate}
              {summary.parsha ? ` · פרשת ${summary.parsha}` : ""}
              {summary.yomTov ? ` · ${summary.yomTov}` : ""}
              {" · "}
              {formatTime(simNow, timezone)}
            </p>
          </div>
          <p className="text-xs font-normal text-muted-foreground">עדכון #{tick}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="תאריך לועזי">
            <input
              type="date"
              value={gregorianDateValue}
              onChange={(event) => applyGregorianDate(event.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none transition-colors focus:border-[var(--board-gold)]"
            />
          </Field>
          <Field label="שעה">
            <input
              type="time"
              value={timeValue}
              onChange={(event) => applyTimeString(event.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none transition-colors focus:border-[var(--board-gold)]"
            />
          </Field>
          <Field label="חודש עברי">
            <Select
              value={jewish.month}
              onChange={(event) => applyHebrewDate({ month: Number(event.target.value) })}
            >
              {hebrewMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="יום ושנה עבריים">
            <div className="flex gap-2">
              <Select
                value={jewish.day}
                onChange={(event) => applyHebrewDate({ day: Number(event.target.value) })}
                className="w-20"
              >
                {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </Select>
              <Select
                value={jewish.year}
                onChange={(event) => applyHebrewDate({ year: Number(event.target.value) })}
              >
                {Array.from({ length: 11 }, (_, index) => jewish.year - 5 + index).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => step(-24 * 60)} title="יום אחורה">
            <Rewind className="h-4 w-4" /> יום
          </Button>
          <Button variant="outline" size="sm" onClick={() => step(-60)} title="שעה אחורה">
            <Rewind className="h-4 w-4" /> שעה
          </Button>
          <Button variant={playing ? "danger" : "gold"} size="sm" onClick={() => setPlaying((value) => !value)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "השהה" : "הפעל"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => step(60)} title="שעה קדימה">
            שעה <FastForward className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => step(24 * 60)} title="יום קדימה">
            יום <FastForward className="h-4 w-4" />
          </Button>
          <Select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="h-8 w-40">
            {speedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button variant="ghost" size="sm" onClick={resetToNow}>
            <RotateCcw className="h-4 w-4" /> חזרה להווה
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="origin-top-right scale-[0.42] md:scale-50 lg:scale-[0.62]" style={{ width: "161.3%", height: "161.3%" }}>
          <BoardShell boardKey={boardKey} initialPayload={initialPayload} disableLocks nowOverride={simNow} />
        </div>
      </div>
    </div>
  );
}
