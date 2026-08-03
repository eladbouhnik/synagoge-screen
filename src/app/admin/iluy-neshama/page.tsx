import { ResourceManager } from "@/components/admin/resource-manager";
import type { BadgeTone } from "@/components/ui/badge";
import { demoIluyNeshama } from "@/lib/demo-data";
import type { IluyNeshama } from "@/types/domain";

const statusLabels: Record<IluyNeshama["status"], { label: string; tone: BadgeTone }> = {
  pending: { label: "ממתין לאישור", tone: "warning" },
  approved: { label: "מאושר", tone: "success" },
  rejected: { label: "נדחה", tone: "danger" },
};

export default function IluyNeshamaPage() {
  return (
    <ResourceManager
      title="עילוי נשמת"
      subtitle="רשומות יארצייט והקדשות — כולל בקשות שהוגשו ישירות ע״י מתפללים, הממתינות לאישורכם"
      storageKey="admin:iluy-neshama"
      resource="iluy-neshama"
      initialRows={demoIluyNeshama}
      listColumns={["deceased_name", "parent_name", "hebrew_death_date"]}
      rowBadge={(row) => (row.status === "approved" ? null : statusLabels[row.status])}
      fields={[
        { key: "gender", label: "מין", type: "select", options: [
          { value: demoIluyNeshama[0].gender, label: "זכר" },
          { value: demoIluyNeshama[1]?.gender ?? demoIluyNeshama[0].gender, label: "נקבה" },
        ] },
        { key: "deceased_name", label: "שם הנפטר" },
        { key: "parent_name", label: "שם הורה" },
        { key: "hebrew_death_date", label: "תאריך פטירה עברי" },
        { key: "donor_name", label: "תורם" },
        {
          key: "status",
          label: "סטטוס",
          type: "select",
          options: [
            { value: "pending", label: statusLabels.pending.label },
            { value: "approved", label: statusLabels.approved.label },
            { value: "rejected", label: statusLabels.rejected.label },
          ],
        },
        { key: "submitter_contact", label: "פרטי קשר של המבקש (לא מוצג בלוח)", hint: "מולא אוטומטית כשהבקשה מגיעה מטופס עצמאי" },
      ]}
      newRow={{
        deceased_name: "",
        parent_name: "",
        gender: demoIluyNeshama[0].gender,
        hebrew_death_date: "",
        donor_name: null,
        status: "approved",
        submitter_contact: null,
      }}
    />
  );
}
