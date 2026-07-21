import Link from "next/link";
import { Crown } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] grid-rows-[auto_1fr_auto] bg-background px-5">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between py-6">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-[var(--board-gold)]">
            <Crown className="h-5 w-5" />
          </span>
          לוח בית הכנסת
        </Link>
        <Link href="/" className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
          חזרה לדף הבית
        </Link>
      </header>
      <div className="grid place-items-center py-8">{children}</div>
      <footer className="mx-auto w-full max-w-5xl border-t border-border py-5 text-center text-xs text-muted-foreground">
        לוח דיגיטלי לבית הכנסת · זמנים מדויקים, הודעות ושיעורים במקום אחד
      </footer>
    </main>
  );
}
