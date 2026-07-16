import { ResourceManager } from "@/components/admin/resource-manager";
import { demoPrayerTimes } from "@/lib/demo-data";

const dayOptions = [
  ["sunday", "א'"], ["monday", "ב'"], ["tuesday", "ג'"], ["wednesday", "ד'"], ["thursday", "ה'"], ["friday", "ו'"], ["shabbat", "שבת"],
].map(([value, label]) => ({ value, label }));

const zmanOptions = [
  ["sunrise", "זריחה"], ["sea_level_sunrise", "זריחה במישור"], ["sof_zman_shema_gra", "סוף זמן קריאת שמע"], ["sof_zman_tfila_gra", "סוף זמן תפילה"], ["chatzot", "חצות"], ["mincha_gedola", "מנחה גדולה"], ["mincha_ketana", "מנחה קטנה"], ["plag_hamincha", "פלג המנחה"], ["sunset", "שקיעה"], ["sea_level_sunset", "שקיעה במישור"], ["tzet", "צאת הכוכבים"], ["tzet_72", "צאת 72"], ["candle_lighting", "כניסת שבת"],
].map(([value, label]) => ({ value, label }));

export default function PrayerTimesPage() {
  return (
    <ResourceManager
      title="זמני תפילות"
      subtitle="קבועים ויחסיים לזמני היום"
      storageKey="admin:prayer-times"
      resource="prayer-times"
      initialRows={demoPrayerTimes}
      fields={[
        { key: "label", label: "שם התפילה" },
        { key: "prayer", label: "סוג תפילה", type: "select", options: ["shacharit", "mincha", "arvit", "musaf", "selichot", "other"].map((value) => ({ value, label: value })) },
        { key: "day_type", label: "סוג יום", type: "select", options: [{ value: "weekday", label: "חול" }, { value: "shabbat", label: "שבת" }, { value: "holiday", label: "חג" }] },
        { key: "days", label: "ימי השבוע", type: "weekday-selector", options: dayOptions },
        { key: "time_mode", label: "מצב זמן", type: "select", options: [{ value: "fixed", label: "שעה קבועה" }, { value: "relative", label: "יחס לזמן היום" }] },
        { key: "fixed_time", label: "שעה קבועה", type: "time" },
        { key: "relative_to", label: "יחסי אל", type: "select", options: zmanOptions },
        { key: "offset_minutes", label: "היסט בדקות", type: "number" },
        { key: "relative_day", label: "יום עוגן", type: "select", options: dayOptions },
        { key: "rounding", label: "עיגול", type: "select", options: ["none", "up5", "down5", "nearest5"].map((value) => ({ value, label: value })) },
        { key: "start_date", label: "מתאריך", type: "date" },
        { key: "end_date", label: "עד תאריך", type: "date" },
        { key: "holiday_tags", label: "חגים מסוימים", type: "tag-list" },
        { key: "is_active", label: "פעיל", type: "checkbox" },
        { key: "minyan_number", label: "מספר מניין", type: "number" },
      ]}
    />
  );
}
