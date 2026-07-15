import { ResourceManager } from "@/components/admin/resource-manager";
import { demoPrayerTimes } from "@/lib/demo-data";

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
        { key: "day_type", label: "סוג יום" },
        { key: "time_mode", label: "מצב זמן" },
        { key: "fixed_time", label: "שעה קבועה", type: "time" },
        { key: "relative_to", label: "יחסי אל" },
        { key: "offset_minutes", label: "היסט בדקות", type: "number" },
        { key: "relative_day", label: "יום עוגן" },
        { key: "rounding", label: "עיגול" },
        { key: "minyan_number", label: "מספר מניין", type: "number" },
      ]}
    />
  );
}
