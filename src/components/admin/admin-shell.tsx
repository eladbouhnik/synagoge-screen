import Link from "next/link";
import { CalendarClock, Eye, LayoutDashboard, Megaphone, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "סקירה", icon: LayoutDashboard },
  { href: "/admin/screens", label: "מסכים", icon: Eye },
  { href: "/admin/prayer-times", label: "זמני תפילות", icon: CalendarClock },
  { href: "/admin/messages", label: "הודעות", icon: Megaphone },
  { href: "/admin/shiurim", label: "שיעורים", icon: CalendarClock },
  { href: "/admin/iluy-neshama", label: "עילוי נשמת", icon: Users },
  { href: "/admin/halachot", label: "הלכות", icon: Megaphone },
  { href: "/admin/parnasim", label: "פרנסים", icon: Users },
  { href: "/admin/congregants", label: "מתפללים", icon: Users },
  { href: "/admin/settings", label: "הגדרות", icon: Settings },
  { href: "/admin/preview", label: "תצוגה מקדימה", icon: Eye },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 right-0 hidden w-72 border-l border-border bg-muted/70 p-5 lg:block">
        <Link href="/admin" className="block">
          <p className="text-sm text-muted-foreground">פאנל ניהול</p>
          <h1 className="mt-1 text-3xl font-black leading-tight">לוח בית כנסת</h1>
        </Link>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition hover:bg-background")}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pr-72">
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
