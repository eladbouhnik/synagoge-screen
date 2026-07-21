import Link from "next/link";
import { Crown, LogOut, MonitorPlay } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOut } from "@/lib/auth/actions";

interface AdminShellProps {
  synagogueName: string;
  boardKey: string;
  demoMode: boolean;
  children: React.ReactNode;
}

export function AdminShell({ synagogueName, boardKey, demoMode, children }: AdminShellProps) {
  const boardHref = `/board/${boardKey}`;

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.006_92)]">
      <aside className="fixed inset-y-0 right-0 hidden w-72 flex-col border-l border-border bg-background lg:flex">
        <div className="h-1 shrink-0 bg-[var(--board-gold)]" />
        <div className="flex min-h-0 flex-1 flex-col p-5">
          <Link href="/welcome" className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-[var(--board-gold)]">
              <Crown className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">פאנל ניהול</span>
              <span className="block truncate font-black leading-tight">{synagogueName}</span>
            </span>
          </Link>
          <div className="my-5 h-px bg-border" />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <AdminNav />
          </div>
          <div className="mt-4 grid gap-2 border-t border-border pt-4">
            <Link
              href={boardHref}
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-md bg-[var(--board)] px-3 py-2.5 text-sm font-bold text-[var(--board-gold)] transition-opacity hover:opacity-90"
            >
              <MonitorPlay className="h-4 w-4" />
              פתיחת המסך
            </Link>
            {demoMode ? (
              <p className="text-center text-xs text-muted-foreground">מצב הדגמה פעיל</p>
            ) : (
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  התנתקות
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>

      <Link
        href={boardHref}
        target="_blank"
        aria-label="פתיחת המסך"
        className="fixed bottom-5 left-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[var(--board)] text-[var(--board-gold)] shadow-lg lg:hidden"
      >
        <MonitorPlay className="h-5 w-5" />
      </Link>

      <main className="lg:pr-72">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
