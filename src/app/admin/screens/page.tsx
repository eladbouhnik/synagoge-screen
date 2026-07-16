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
        { key: "config", label: "תפאורת רקע", type: "config-select", configKey: "background_variant", options: [
          { value: "parochet", label: "פרוכת וכתר" },
          { value: "arches", label: "היכל קשתות" },
          { value: "stars", label: "שמי שבת" },
          { value: "mosaic", label: "פסיפס ספיר" },
          { value: "pomegranates", label: "רימונים ופרוכת" },
        ] },
        { key: "sort_order", label: "סדר", type: "number" },
        { key: "is_visible", label: "מוצג", type: "checkbox" },
      ]}
    />
  );
}
