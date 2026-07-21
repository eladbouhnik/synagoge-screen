"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  Crown,
  Eye,
  LayoutDashboard,
  Megaphone,
  MonitorPlay,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "סקירה", icon: LayoutDashboard },
  { href: "/admin/screens", label: "מסכים", icon: MonitorPlay },
  { href: "/admin/prayer-times", label: "זמני תפילות", icon: CalendarClock },
  { href: "/admin/messages", label: "הודעות", icon: Megaphone },
  { href: "/admin/shiurim", label: "שיעורים", icon: BookOpen },
  { href: "/admin/halachot", label: "הלכות", icon: ScrollText },
  { href: "/admin/parnasim", label: "פרנסים", icon: Crown },
  { href: "/admin/congregants", label: "מתפללים", icon: Users },
  { href: "/admin/settings", label: "הגדרות", icon: Settings },
  { href: "/admin/team", label: "משתמשים והרשאות", icon: ShieldCheck },
  { href: "/admin/preview", label: "תצוגה מקדימה", icon: Eye },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-0.5">
      {nav.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors",
              active
                ? "bg-[oklch(0.93_0.045_88)] text-[oklch(0.35_0.06_86)] shadow-[inset_2px_0_0_0_var(--board-gold)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
