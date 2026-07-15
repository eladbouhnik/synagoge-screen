import { ResourceManager } from "@/components/admin/resource-manager";
import { demoMessages } from "@/lib/demo-data";

export default function MessagesPage() {
  return (
    <ResourceManager
      title="הודעות"
      subtitle="מודעות מתוזמנות ללוח"
      storageKey="admin:messages"
      resource="messages"
      initialRows={demoMessages}
      fields={[
        { key: "title", label: "כותרת" },
        { key: "body", label: "תוכן", type: "textarea" },
        { key: "start_date", label: "תאריך התחלה", type: "date" },
        { key: "end_date", label: "תאריך סיום", type: "date" },
        { key: "is_active", label: "פעיל", type: "checkbox" },
      ]}
    />
  );
}
