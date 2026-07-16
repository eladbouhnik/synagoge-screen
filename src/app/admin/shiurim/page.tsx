import { ResourceManager } from "@/components/admin/resource-manager";
import { demoShiurim } from "@/lib/demo-data";

const dayOptions = [
  ["sunday", "א'"], ["monday", "ב'"], ["tuesday", "ג'"], ["wednesday", "ד'"], ["thursday", "ה'"], ["friday", "ו'"], ["shabbat", "שבת"],
].map(([value, label]) => ({ value, label }));

const zmanOptions = [
  ["sunrise", "זריחה"], ["chatzot", "חצות"], ["mincha_gedola", "מנחה גדולה"], ["mincha_ketana", "מנחה קטנה"], ["plag_hamincha", "פלג המנחה"], ["sunset", "שקיעה"], ["tzet", "צאת הכוכבים"], ["tzet_72", "צאת 72"], ["candle_lighting", "כניסת שבת"],
].map(([value, label]) => ({ value, label }));

export default function ShiurimPage() {
  return (
    <ResourceManager
      title="שיעורים"
      subtitle="שיעורים ונעילת מסך בזמן פעילות"
      storageKey="admin:shiurim"
      resource="shiurim"
      initialRows={demoShiurim}
      fields={[
        { key: "title", label: "שם השיעור" },
        { key: "rabbi_name", label: "שם הרב" },
        { key: "day_type", label: "סוג יום", type: "select", options: [{ value: "weekday", label: "חול" }, { value: "shabbat", label: "שבת" }, { value: "holiday", label: "חג" }] },
        { key: "days", label: "ימי השבוע", type: "weekday-selector", options: dayOptions },
        { key: "time_mode", label: "מצב זמן", type: "select", options: [{ value: "fixed", label: "שעה קבועה" }, { value: "relative", label: "יחס לזמן היום" }] },
        { key: "fixed_time", label: "שעה קבועה", type: "time" },
        { key: "relative_to", label: "יחסי אל", type: "select", options: zmanOptions },
        { key: "offset_minutes", label: "היסט בדקות", type: "number" },
        { key: "duration_minutes", label: "משך בדקות", type: "number" },
        { key: "start_date", label: "מתאריך", type: "date" },
        { key: "end_date", label: "עד תאריך", type: "date" },
        { key: "holiday_tags", label: "חגים מסוימים", type: "tag-list" },
        { key: "is_active", label: "פעיל", type: "checkbox" },
      ]}
    />
  );
}
