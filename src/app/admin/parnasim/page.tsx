"use client";

import { ResourceManager } from "@/components/admin/resource-manager";
import { demoParnasim } from "@/lib/demo-data";
import { isActiveDateRange } from "@/lib/utils";

export default function ParnasimPage() {
  const now = new Date();

  return (
    <ResourceManager
      title="פרנסים"
      subtitle="הקדשות וברכות לפי תקופה"
      storageKey="admin:parnasim"
      resource="parnasim"
      initialRows={demoParnasim}
      listColumns={["parnas_name", "period", "start_date", "end_date"]}
      rowBadge={(row) =>
        isActiveDateRange(row.start_date, row.end_date, now)
          ? { label: "מוצג כעת", tone: "success" }
          : { label: "לא בתקופה", tone: "neutral" }
      }
      fields={[
        { key: "parnas_name", label: "שם הפרנס" },
        { key: "blessing", label: "ברכה", type: "textarea" },
        { key: "period", label: "תקופה", type: "select", options: [
          { value: "יום", label: "פרנס היום" },
          { value: "חודש", label: "פרנס החודש" },
          { value: "שנה", label: "פרנס השנה" },
        ] },
        { key: "start_date", label: "התחלה", type: "date" },
        { key: "end_date", label: "סיום", type: "date" },
      ]}
      newRow={{ parnas_name: "", blessing: "", start_date: new Date().toISOString().slice(0, 10), end_date: new Date().toISOString().slice(0, 10), period: "חודש", phone: null }}
      validateRow={(row) => {
        if (!row.parnas_name?.trim()) return "יש להזין את שם הפרנס.";
        if (row.end_date < row.start_date) return "תאריך הסיום חייב להיות אחרי תאריך ההתחלה.";
        return null;
      }}
    />
  );
}
