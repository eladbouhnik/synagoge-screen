"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { PrayerTime, RelativeDay } from "@/types/domain";
import { ResourceManager } from "@/components/admin/resource-manager";
import { demoPrayerTimes } from "@/lib/demo-data";

const dayOptions = [
  ["sunday", "א'"], ["monday", "ב'"], ["tuesday", "ג'"], ["wednesday", "ד'"], ["thursday", "ה'"], ["friday", "ו'"], ["shabbat", "שבת"],
].map(([value, label]) => ({ value, label }));

const zmanOptions = [
  ["sunrise", "זריחה"], ["sea_level_sunrise", "זריחה במישור"], ["sof_zman_shema_gra", "סוף זמן קריאת שמע"], ["sof_zman_tfila_gra", "סוף זמן תפילה"], ["chatzot", "חצות"], ["mincha_gedola", "מנחה גדולה"], ["mincha_ketana", "מנחה קטנה"], ["plag_hamincha", "פלג המנחה"], ["sunset", "שקיעה"], ["sea_level_sunset", "שקיעה במישור"], ["tzet", "צאת הכוכבים"], ["tzet_72", "צאת 72"], ["tzet_shabbat", "צאת שבת"], ["tzet_shabbat_rt", "צאת שבת (ר\"ת)"], ["candle_lighting", "כניסת שבת"],
].map(([value, label]) => ({ value, label }));

const weekdayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const weekdayLabel: Record<string, string> = { sunday: "א'", monday: "ב'", tuesday: "ג'", wednesday: "ד'", thursday: "ה'", friday: "ו'" };

function summarizeDays(dayType: string, days: RelativeDay[] | undefined): string {
  if (dayType === "erev_shabbat") return "ערב שבת";
  if (dayType === "shabbat") return "שבת";
  if (dayType === "holiday") return "חגים";
  const active = weekdayOrder.filter((d) => days?.includes(d));
  if (active.length === 0) return "—";
  if (active.length === 6) return "א'-ו'";
  if (active.length === 5 && !active.includes("friday")) return "א'-ה'";
  return active.map((d) => weekdayLabel[d]).join(", ");
}

function summarizeTime(timeMode: string, fixedTime: string | null, relativeTo: string | null, offsetMinutes: number): string {
  if (timeMode === "fixed") return fixedTime ?? "";
  const label = zmanOptions.find((z) => z.value === relativeTo)?.label ?? "";
  if (offsetMinutes === 0) return label;
  const abs = Math.abs(offsetMinutes);
  return `${abs}ד ${offsetMinutes < 0 ? "לפני" : "אחרי"} ${label}`;
}

const prayerMeta: Record<string, { label: string; color: string }> = {
  shacharit: { label: "שחרית", color: "bg-sky-50 text-sky-700 border-sky-200" },
  mincha:    { label: "מנחה",   color: "bg-amber-50 text-amber-700 border-amber-200" },
  arvit:     { label: "ערבית",  color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  musaf:     { label: "מוסף",   color: "bg-purple-50 text-purple-700 border-purple-200" },
  selichot:  { label: "סליחות", color: "bg-rose-50 text-rose-700 border-rose-200" },
  other:     { label: "אחר",    color: "bg-muted text-muted-foreground border-border" },
};

const dayGroups: { key: string; label: string }[] = [
  { key: "weekday",      label: "חול" },
  { key: "erev_shabbat", label: "ערב שבת" },
  { key: "shabbat",      label: "שבת" },
  { key: "holiday",      label: "חגים" },
];

function PrayerTimesList(
  rows: PrayerTime[],
  onEdit: (row: PrayerTime) => void,
  onDelete: (row: PrayerTime) => void,
) {
  return (
    <div className="grid gap-6 p-6">
      {dayGroups.map(({ key, label }) => {
        const group = rows.filter((r) => r.day_type === key);
        if (group.length === 0) return null;
        return (
          <div key={key}>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.map((row) => {
                const meta = prayerMeta[row.prayer] ?? prayerMeta.other;
                const timeDisplay = summarizeTime(row.time_mode, row.fixed_time, row.relative_to, row.offset_minutes);
                const isFixed = row.time_mode === "fixed";
                const inactive = row.is_active === false;
                return (
                  <div
                    key={row.id}
                    className={`group relative flex flex-col gap-3 rounded-xl border bg-background p-4 transition-opacity ${inactive ? "opacity-40" : ""}`}
                  >
                    {/* actions */}
                    <div className="absolute left-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:border-[var(--board-gold)] hover:text-foreground"
                        aria-label="עריכה"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600"
                        aria-label="מחיקה"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* header row */}
                    <div className="flex flex-wrap items-center gap-2 pr-1">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
                      {(row.minyan_number ?? 1) > 1 && (
                        <span className="text-xs text-muted-foreground">מניין {row.minyan_number}</span>
                      )}
                    </div>

                    {/* name */}
                    <p className="text-base font-black leading-tight">{row.label}</p>

                    {/* time */}
                    <p className={`font-black tabular-nums ${isFixed ? "text-3xl" : "text-lg text-muted-foreground"}`}>
                      {isFixed ? timeDisplay : `~ ${timeDisplay}`}
                    </p>

                    {/* days tag — only for חול */}
                    {key === "weekday" && (
                      <p className="text-xs text-muted-foreground">{summarizeDays(row.day_type, row.days)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PrayerTimesPage() {
  return (
    <ResourceManager
      title="זמני תפילות"
      subtitle="קבועים ויחסיים לזמני היום"
      storageKey="admin:prayer-times"
      resource="prayer-times"
      initialRows={demoPrayerTimes}
      listColumns={["label", "days", "time_mode"]}
      rowBadge={(row) => (row.is_active ? null : { label: "כבוי", tone: "neutral" })}
      getCellDisplay={(key, row) => {
        if (key === "days") return summarizeDays(row.day_type, row.days);
        if (key === "time_mode") return summarizeTime(row.time_mode, row.fixed_time, row.relative_to, row.offset_minutes);
        return undefined;
      }}
      renderList={PrayerTimesList}
      fields={[
        { key: "label", label: "שם התפילה", sectionStart: "שם וסוג" },
        { key: "prayer", label: "סוג תפילה", type: "select", options: [
          { value: "shacharit", label: "שחרית" },
          { value: "mincha", label: "מנחה" },
          { value: "arvit", label: "ערבית" },
          { value: "musaf", label: "מוסף" },
          { value: "selichot", label: "סליחות" },
          { value: "other", label: "אחר" },
        ] },
        { key: "minyan_number", label: "מספר מניין", type: "number", min: 1 },
        { key: "is_active", label: "פעיל", type: "checkbox" },

        { key: "day_type", label: "סוג יום", type: "select", sectionStart: "ימים", options: [
          { value: "weekday", label: "חול" },
          { value: "erev_shabbat", label: "ערב שבת" },
          { value: "shabbat", label: "שבת" },
          { value: "holiday", label: "חג" },
        ] },
        { key: "days", label: "ימי השבוע", type: "weekday-selector", options: dayOptions, visibleWhen: [{ field: "day_type", equals: "weekday" }] },
        { key: "holiday_tags", label: "חגים מסוימים", type: "tag-list", hint: "השאירו ריק לכל החגים", visibleWhen: [{ field: "day_type", equals: "holiday" }] },
        { key: "start_date", label: "מתאריך", type: "date" },
        { key: "end_date", label: "עד תאריך", type: "date" },

        { key: "time_mode", label: "סוג זמן", type: "radio", sectionStart: "זמן", options: [
          { value: "fixed", label: "שעה קבועה" },
          { value: "relative", label: "יחסי לזמן היום" },
        ] },
        { key: "fixed_time", label: "שעה קבועה", type: "time", visibleWhen: [{ field: "time_mode", equals: "fixed" }] },
        { key: "relative_to", label: "יחסי אל", type: "select", options: zmanOptions, visibleWhen: [{ field: "time_mode", equals: "relative" }] },
        { key: "offset_minutes", label: "היסט בדקות", type: "number", hint: "שלילי = לפני, חיובי = אחרי", visibleWhen: [{ field: "time_mode", equals: "relative" }] },
        { key: "rounding", label: "עיגול", type: "select", visibleWhen: [{ field: "time_mode", equals: "relative" }], options: [
          { value: "none", label: "ללא עיגול" },
          { value: "up5", label: "עיגול מעלה ל־5 דקות" },
          { value: "down5", label: "עיגול מטה ל־5 דקות" },
          { value: "nearest5", label: "ל־5 הדקות הקרובות" },
        ] },
      ]}
      newRow={{ day_type: "weekday", prayer: "shacharit", label: "", time_mode: "fixed", fixed_time: "07:00", relative_to: null, offset_minutes: 0, rounding: "nearest5", minyan_number: 1, days: [], start_date: null, end_date: null, holiday_tags: [], is_active: true }}
      validateRow={(row) => {
        if (!row.label?.trim()) return "יש להזין שם לתפילה.";
        if (row.time_mode === "fixed" && !row.fixed_time) return "יש להזין שעה קבועה.";
        if (row.time_mode === "relative" && !row.relative_to) return "יש לבחור זמן יום לעוגן היחסי.";
        if (row.start_date && row.end_date && row.end_date < row.start_date) return "תאריך הסיום חייב להיות אחרי תאריך ההתחלה.";
        return null;
      }}
    />
  );
}
