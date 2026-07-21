"use client";

import { ResourceManager } from "@/components/admin/resource-manager";
import { demoShiurim } from "@/lib/demo-data";

const dayOptions = [
  ["sunday", "א'"], ["monday", "ב'"], ["tuesday", "ג'"], ["wednesday", "ד'"], ["thursday", "ה'"], ["friday", "ו'"], ["shabbat", "שבת"],
].map(([value, label]) => ({ value, label }));

const zmanOptions = [
  ["sunrise", "זריחה"], ["chatzot", "חצות"], ["mincha_gedola", "מנחה גדולה"], ["mincha_ketana", "מנחה קטנה"], ["plag_hamincha", "פלג המנחה"], ["sunset", "שקיעה"], ["tzet", "צאת הכוכבים"], ["tzet_72", "צאת 72"], ["tzet_shabbat", "צאת שבת"], ["tzet_shabbat_rt", "צאת שבת (ר\"ת)"], ["candle_lighting", "כניסת שבת"],
].map(([value, label]) => ({ value, label }));

export default function ShiurimPage() {
  return (
    <ResourceManager
      title="שיעורים"
      subtitle="שיעורים ונעילת מסך בזמן פעילות"
      storageKey="admin:shiurim"
      resource="shiurim"
      initialRows={demoShiurim}
      listColumns={["title", "rabbi_name", "day_type", "time_mode"]}
      rowBadge={(row) => (row.is_active ? null : { label: "כבוי", tone: "neutral" })}
      fields={[
        { key: "title", label: "שם השיעור" },
        { key: "rabbi_name", label: "שם הרב" },
        { key: "day_type", label: "סוג יום", type: "select", options: [{ value: "weekday", label: "חול" }, { value: "shabbat", label: "שבת" }, { value: "holiday", label: "חג" }] },
        { key: "days", label: "ימי השבוע", type: "weekday-selector", options: dayOptions, visibleWhen: [{ field: "day_type", in: ["weekday", "shabbat"] }] },
        { key: "holiday_tags", label: "חגים מסוימים", type: "tag-list", hint: "השאירו ריק לכל החגים", visibleWhen: [{ field: "day_type", equals: "holiday" }] },
        { key: "time_mode", label: "מצב זמן", type: "select", options: [{ value: "fixed", label: "שעה קבועה" }, { value: "relative", label: "יחס לזמן היום" }] },
        { key: "fixed_time", label: "שעת התחלה", type: "time", visibleWhen: [{ field: "time_mode", equals: "fixed" }] },
        { key: "relative_to", label: "יחסי אל", type: "select", options: zmanOptions, visibleWhen: [{ field: "time_mode", equals: "relative" }] },
        { key: "offset_minutes", label: "היסט בדקות", type: "number", hint: "שלילי = לפני, חיובי = אחרי", visibleWhen: [{ field: "time_mode", equals: "relative" }] },
        { key: "duration_minutes", label: "משך בדקות", type: "number", min: 1 },
        { key: "start_date", label: "מתאריך", type: "date" },
        { key: "end_date", label: "עד תאריך", type: "date" },
        { key: "is_active", label: "פעיל", type: "checkbox" },
      ]}
      newRow={{ day_type: "weekday", title: "", rabbi_name: "", days: [], time_mode: "fixed", fixed_time: "20:00", relative_to: null, offset_minutes: 0, duration_minutes: 45, is_active: true, start_date: null, end_date: null, holiday_tags: [] }}
      validateRow={(row) => {
        if (!row.title?.trim()) return "יש להזין שם לשיעור.";
        if (row.time_mode === "fixed" && !row.fixed_time) return "יש להזין שעת התחלה.";
        if (row.time_mode === "relative" && !row.relative_to) return "יש לבחור זמן יום לעוגן היחסי.";
        if (row.duration_minutes < 1) return "משך השיעור חייב להיות לפחות דקה.";
        if (row.start_date && row.end_date && row.end_date < row.start_date) return "תאריך הסיום חייב להיות אחרי תאריך ההתחלה.";
        return null;
      }}
    />
  );
}
