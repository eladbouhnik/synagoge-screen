import { ResourceManager } from "@/components/admin/resource-manager";
import { demoParnasim } from "@/lib/demo-data";

export default function ParnasimPage() {
  return (
    <ResourceManager
      title="פרנסים"
      subtitle="הקדשות וברכות לפי תקופה"
      storageKey="admin:parnasim"
      resource="parnasim"
      initialRows={demoParnasim}
      fields={[
        { key: "parnas_name", label: "שם הפרנס" },
        { key: "blessing", label: "ברכה", type: "textarea" },
        { key: "start_date", label: "התחלה", type: "date" },
        { key: "end_date", label: "סיום", type: "date" },
        { key: "period", label: "תקופה" },
      ]}
    />
  );
}
