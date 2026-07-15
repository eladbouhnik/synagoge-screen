import { ResourceManager } from "@/components/admin/resource-manager";
import { demoHalachot } from "@/lib/demo-data";

export default function HalachotPage() {
  return (
    <ResourceManager
      title="הלכות"
      subtitle="מאגר הלכות להצגה יומית"
      storageKey="admin:halachot"
      resource="halachot"
      initialRows={demoHalachot}
      fields={[
        { key: "category", label: "קטגוריה" },
        { key: "body", label: "טקסט ההלכה", type: "textarea" },
        { key: "holiday_tag", label: "תג חג" },
        { key: "is_selected", label: "נבחר להצגה", type: "checkbox" },
      ]}
    />
  );
}
