import { ResourceManager } from "@/components/admin/resource-manager";
import { demoSynagogue } from "@/lib/demo-data";

export default function SettingsPage() {
  return (
    <ResourceManager
      title="הגדרות כלליות"
      subtitle="מיקום, נוסח והעדפות זמנים"
      storageKey="admin:settings"
      resource="settings"
      initialRows={[demoSynagogue as unknown as Record<string, unknown> & { id: string }]}
      fields={[
        { key: "name", label: "שם בית הכנסת" },
        { key: "address", label: "כתובת" },
        { key: "latitude", label: "קו רוחב", type: "number" },
        { key: "longitude", label: "קו אורך", type: "number" },
        { key: "elevation", label: "גובה", type: "number" },
        { key: "timezone", label: "אזור זמן" },
        { key: "nusach", label: "נוסח" },
        { key: "candle_lighting_minutes", label: "דקות להדלקת נרות", type: "number" },
      ]}
    />
  );
}
