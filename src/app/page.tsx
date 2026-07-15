import Link from "next/link";
import { Clock, Monitor, Settings } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            מערכת RTL מלאה לזמני היום, תפילות ומודעות
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-normal text-foreground md:text-7xl">
              לוח בית כנסת דיגיטלי
            </h1>
            <p className="max-w-2xl text-xl leading-8 text-muted-foreground">
              תצוגת מסך רחב לבית הכנסת ופאנל ניהול לגבאים, עם מנוע זמני היום, נתוני דמו מקומיים וחיבור מוכן ל־Supabase.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/board/demo-board"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Monitor className="h-5 w-5" />
              פתיחת לוח תצוגה
            </Link>
            <Link
              href="/admin"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-background px-5 font-bold transition hover:bg-muted"
            >
              <Settings className="h-5 w-5" />
              כניסה לפאנל
            </Link>
          </div>
        </div>
        <div className="self-center rounded-lg border border-border bg-muted p-5">
          <div className="rounded-md bg-board p-6 text-board-foreground shadow-2xl">
            <p className="text-lg text-board-foreground/70">היום</p>
            <p className="mt-3 text-4xl font-black">י׳ תמוז תשפ״ו</p>
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                ["שחרית", "07:15"],
                ["מנחה", "19:25"],
                ["ערבית", "20:20"],
                ["שקיעה", "19:45"],
              ].map(([label, time]) => (
                <div key={label} className="rounded-md border border-board-foreground/15 p-4">
                  <p className="text-board-foreground/70">{label}</p>
                  <p className="text-3xl font-black">{time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
