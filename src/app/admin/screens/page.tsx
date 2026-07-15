import { ResourceManager } from "@/components/admin/resource-manager";
import { demoScreens } from "@/lib/demo-data";

export default function ScreensPage() {
  return (
    <ResourceManager
      title="מסכים"
      subtitle="סדר, משך תצוגה ונראות בסבב"
      storageKey="admin:screens"
      resource="screens"
      initialRows={demoScreens}
      fields={[
        { key: "title", label: "כותרת" },
        { key: "type", label: "סוג מסך" },
        { key: "duration_seconds", label: "משך בשניות", type: "number" },
        { key: "sort_order", label: "סדר", type: "number" },
        { key: "is_visible", label: "מוצג", type: "checkbox" },
      ]}
    />
  );
}
