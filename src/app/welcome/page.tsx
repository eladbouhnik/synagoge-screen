import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, MonitorPlay } from "lucide-react";
import { getAdminSynagogue } from "@/lib/admin/synagogue";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { BoardLinkCopy } from "@/components/auth/board-link-copy";

export const metadata: Metadata = { title: "לאן ממשיכים? | לוח בית הכנסת" };

export default async function WelcomePage() {
  const synagogue = await getAdminSynagogue();
  if (!synagogue) {
    redirect(hasSupabaseEnv() ? "/login" : "/");
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-3xl">
        <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
        <p className="mt-4 text-sm text-muted-foreground">ברוכים הבאים</p>
        <h1 className="mt-1 text-4xl font-black">{synagogue.name}</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin"
            className="group grid content-start gap-3 rounded-xl border border-border bg-background p-7 shadow-[0_16px_32px_-24px_oklch(0.25_0.04_255/0.4)] transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-[var(--board-gold)]">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            <span className="text-2xl font-black">פאנל ניהול</span>
            <span className="text-sm text-muted-foreground">
              עדכון זמני תפילות, הודעות, שיעורים ועיצוב המסכים
            </span>
          </Link>

          <Link
            href={`/board/${synagogue.board_key}`}
            target="_blank"
            className="group grid content-start gap-3 rounded-xl border border-border bg-[var(--board)] p-7 text-[var(--board-foreground)] shadow-[0_16px_32px_-24px_oklch(0.25_0.04_255/0.6)] transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--board-panel)] text-[var(--board-gold)]">
              <MonitorPlay className="h-6 w-6" />
            </span>
            <span className="text-2xl font-black">מסך התצוגה</span>
            <span className="text-sm opacity-80">
              הלוח החי — פותחים על מסך הטלוויזיה בבית הכנסת
            </span>
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>קישור למסך הטלוויזיה:</span>
          <BoardLinkCopy boardKey={synagogue.board_key} />
        </div>
      </div>
    </main>
  );
}
