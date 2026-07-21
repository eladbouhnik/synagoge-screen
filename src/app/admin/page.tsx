import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarClock, Megaphone, MonitorPlay } from "lucide-react";
import { getAdminSynagogue } from "@/lib/admin/synagogue";
import { getBoardPayload } from "@/lib/data/board";
import { demoSynagogue } from "@/lib/demo-data";

const quickLinks = [
  { href: "/admin/prayer-times", label: "עדכון זמני תפילות", description: "מניינים, זמנים קבועים ויחסיים" },
  { href: "/admin/messages", label: "פרסום הודעה", description: "הודעות קהילה עם רמות דחיפות" },
  { href: "/admin/screens", label: "עיצוב המסכים", description: "פריסות, רקעים ותצוגה מקדימה" },
];

export default async function AdminPage() {
  const synagogue = (await getAdminSynagogue()) ?? demoSynagogue;
  const payload = await getBoardPayload(synagogue.board_key);

  const metrics: [string, number, React.ComponentType<{ className?: string }>][] = [
    ["מסכים פעילים", payload.screens.filter((screen) => screen.is_visible).length, MonitorPlay],
    ["זמני תפילות", payload.prayerTimes.length, CalendarClock],
    ["הודעות פעילות", payload.messages.filter((message) => message.is_active).length, Megaphone],
    ["שיעורים", payload.shiurim.length, BookOpen],
  ];

  return (
    <section className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{synagogue.address || "לוח בית הכנסת"}</p>
          <h2 className="mt-1 text-4xl font-black">{synagogue.name}</h2>
        </div>
        <Link
          href={`/board/${synagogue.board_key}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--board)] px-4 py-2.5 font-bold text-[var(--board-gold)] transition-opacity hover:opacity-90"
        >
          <MonitorPlay className="h-4 w-4" />
          פתיחת הלוח
        </Link>
      </div>

      <div className="grid grid-cols-2 divide-x divide-x-reverse divide-border rounded-xl border border-border bg-background md:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
          <div key={label} className="p-5 md:p-6">
            <Icon className="h-4 w-4 text-[var(--accent)]" />
            <p className="mt-3 text-3xl font-black tabular-nums">{value}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-black">פעולות מהירות</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-5 transition-colors hover:border-[var(--board-gold)]"
            >
              <span>
                <span className="block font-black">{link.label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{link.description}</span>
              </span>
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
