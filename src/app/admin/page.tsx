import Link from "next/link";
import { demoMessages, demoPrayerTimes, demoScreens, demoShiurim, demoSynagogue } from "@/lib/demo-data";

export default function AdminPage() {
  const metrics = [
    ["מסכים פעילים", demoScreens.filter((screen) => screen.is_visible).length],
    ["זמני תפילות", demoPrayerTimes.length],
    ["הודעות פעילות", demoMessages.filter((message) => message.is_active).length],
    ["שיעורים", demoShiurim.length],
  ];

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{demoSynagogue.address}</p>
          <h2 className="mt-1 text-4xl font-black">{demoSynagogue.name}</h2>
        </div>
        <Link href="/board/demo-board" className="rounded-md bg-primary px-4 py-2.5 font-bold text-primary-foreground">
          פתיחת לוח
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-muted p-5 shadow-[inset_0_2px_0_0_var(--board-gold-muted)]">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-4xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-background p-6 shadow-[inset_0_2px_0_0_var(--board-gold-muted)]">
        <h3 className="text-2xl font-black">מצב מערכת</h3>
        <div className="mt-5 grid gap-3 text-muted-foreground">
          <p>מצב דמו פעיל כל עוד משתני Supabase אינם מוגדרים.</p>
          <p>נתיב תצוגה ציבורי: /board/demo-board</p>
          <p>מיגרציות Supabase נמצאות בתיקיית supabase/migrations.</p>
        </div>
      </div>
    </section>
  );
}
