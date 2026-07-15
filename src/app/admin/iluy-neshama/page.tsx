import { ResourceManager } from "@/components/admin/resource-manager";
import { demoIluyNeshama } from "@/lib/demo-data";

export default function IluyNeshamaPage() {
  return (
    <ResourceManager
      title="עילוי נשמת"
      subtitle="רשומות יארצייט והקדשות"
      storageKey="admin:iluy-neshama"
      resource="iluy-neshama"
      initialRows={demoIluyNeshama}
      fields={[
        { key: "deceased_name", label: "שם הנפטר" },
        { key: "parent_name", label: "שם הורה" },
        { key: "hebrew_death_date", label: "תאריך פטירה עברי" },
        { key: "donor_name", label: "תורם" },
      ]}
    />
  );
}
