import { ResourceManager } from "@/components/admin/resource-manager";
import { demoShiurim } from "@/lib/demo-data";

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
        { key: "fixed_time", label: "שעה", type: "time" },
        { key: "duration_minutes", label: "משך בדקות", type: "number" },
        { key: "is_active", label: "פעיל", type: "checkbox" },
      ]}
    />
  );
}
