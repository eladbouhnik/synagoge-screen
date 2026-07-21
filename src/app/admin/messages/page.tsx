"use client";

import { ResourceManager } from "@/components/admin/resource-manager";
import { demoMessages } from "@/lib/demo-data";

function daysUntil(date: string, now: Date): number {
  const end = new Date(`${date}T23:59:59`);
  return Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export default function MessagesPage() {
  const now = new Date();

  return (
    <ResourceManager
      title="הודעות"
      subtitle="מודעות מתוזמנות ללוח, עם רמות דחיפות וחלון שעות"
      storageKey="admin:messages"
      resource="messages"
      initialRows={demoMessages}
      listColumns={["title", "urgency", "start_date", "end_date"]}
      rowBadge={(row) => {
        if (row.end_date) {
          const remaining = daysUntil(row.end_date, now);
          if (remaining < 0) return { label: "פג תוקף", tone: "danger" };
          if (remaining <= 3) return { label: `פג בעוד ${remaining === 0 ? "היום" : `${remaining} ימים`}`, tone: "warning" };
        }
        if (row.urgency === "urgent") return { label: "דחוף", tone: "danger" };
        if (row.urgency === "important") return { label: "חשוב", tone: "gold" };
        return null;
      }}
      isRowMuted={(row) => Boolean(row.end_date && daysUntil(row.end_date, now) < 0)}
      fields={[
        { key: "title", label: "כותרת" },
        { key: "body", label: "תוכן", type: "textarea" },
        { key: "urgency", label: "רמת דחיפות", type: "select", hint: "הודעה דחופה מודגשת על הלוח ומוצגת ראשונה", options: [
          { value: "regular", label: "רגילה" },
          { value: "important", label: "חשובה" },
          { value: "urgent", label: "דחופה" },
        ] },
        { key: "start_date", label: "תאריך התחלה", type: "date" },
        { key: "end_date", label: "תאריך סיום", type: "date", hint: "הודעה שפג תוקפה יורדת מהלוח אוטומטית" },
        { key: "show_from", label: "הצגה משעה", type: "time", hint: "השאירו ריק להצגה כל היום" },
        { key: "show_until", label: "הצגה עד שעה", type: "time" },
        { key: "is_active", label: "פעיל", type: "checkbox" },
      ]}
      newRow={{ title: "", body: "", background_url: null, style: {}, start_date: null, end_date: null, is_active: true, urgency: "regular", show_from: null, show_until: null }}
      validateRow={(row) => {
        if (!row.title?.trim()) return "יש להזין כותרת להודעה.";
        if (row.start_date && row.end_date && row.end_date < row.start_date) return "תאריך הסיום חייב להיות אחרי תאריך ההתחלה.";
        return null;
      }}
    />
  );
}
