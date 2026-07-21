import { ResourceManager } from "@/components/admin/resource-manager";
import { demoCongregants } from "@/lib/demo-data";

export default function CongregantsPage() {
  return (
    <ResourceManager
      title="מתפללים"
      subtitle="ימי הולדת ותשתית לאפליקציה עתידית"
      storageKey="admin:congregants"
      resource="congregants"
      initialRows={demoCongregants}
      fields={[
        { key: "full_name", label: "שם מלא" },
        { key: "hebrew_birth_date", label: "תאריך עברי" },
        { key: "gregorian_birth_date", label: "תאריך לועזי", type: "date" },
        { key: "phone", label: "טלפון" },
      ]}
      newRow={{ full_name: "", hebrew_birth_date: null, gregorian_birth_date: null, phone: null }}
    />
  );
}
