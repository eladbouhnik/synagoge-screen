import type { Metadata } from "next";
import Link from "next/link";
import {
  BellRing,
  BookOpenCheck,
  CalendarClock,
  Crown,
  MonitorPlay,
  Quote,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { getBoardPayload } from "@/lib/data/board";
import { screenBackgroundLabels, screenBackgrounds } from "@/lib/board/screen-config";
import { HeroBoard } from "@/components/landing/hero-board";

export const metadata: Metadata = {
  title: "לוח בית הכנסת — לוח דיגיטלי חכם לזמני תפילות, הודעות ושיעורים",
  description:
    "לוח דיגיטלי לבית הכנסת: זמני תפילות מדויקים לפי מיקום, הודעות קהילה, שיעורים והלכה יומית — מתעדכן מהטלפון של הגבאי, בזמן אמת.",
};

const features = [
  {
    icon: CalendarClock,
    title: "זמנים שמחשבים את עצמם",
    body: "מנחה 20 דקות לפני שקיעה? מגדירים פעם אחת. הלוח מחשב כל יום מחדש לפי המיקום המדויק של בית הכנסת — זריחה, שקיעה, צאת הכוכבים והדלקת נרות.",
  },
  {
    icon: BellRing,
    title: "הודעות עם רמות דחיפות",
    body: "הודעה דחופה מודגשת וקופצת ראשונה. כל הודעה עם תאריכי תוקף וחלון שעות — ויורדת מהלוח לבד כשהיא כבר לא רלוונטית.",
  },
  {
    icon: BookOpenCheck,
    title: "הלכה יומית אוטומטית",
    body: "רמב״ם יומי, קיצור שולחן ערוך וערוך השולחן מתעדכנים כל בוקר בלי לגעת. אפשר גם לכתוב הלכות משלכם.",
  },
  {
    icon: MonitorPlay,
    title: "מסכים בעיצוב מלכותי",
    body: "פרוכת, קשתות, פסיפס ורימונים: עשרים וחמש תפאורות מעוצבות ושבע פריסות מסך. בוחרים מה מוצג, כמה זמן, ובאילו ימים.",
  },
  {
    icon: Smartphone,
    title: "מתעדכן מהטלפון, מיד",
    body: "הגבאי מעדכן מהנייד בבית — והלוח בבית הכנסת מתחלף באותה שנייה. בלי מחשב, בלי החלפת קבצים, בלי דפים מודבקים.",
  },
  {
    icon: Crown,
    title: "פרנסים, הקדשות וימי הולדת",
    body: "פרנס החודש עם ברכתו, הקדשות לעילוי נשמה וימי הולדת של המתפללים — הכל במקום מכובד על הלוח.",
  },
];

const steps = [
  { title: "נרשמים", body: "פותחים חשבון בדקה. הלוח נוצר מיד עם מסכי פתיחה מוכנים." },
  { title: "מגדירים", body: "מזינים זמני תפילות, הודעות ושיעורים מהפאנל — הכל בעברית, הכל פשוט." },
  { title: "מחברים טלוויזיה", body: "פותחים את קישור הלוח על מסך חכם או סטרימר — וזהו. מכאן הכל מתעדכן לבד." },
];

const faqs = [
  {
    question: "מה צריך כדי להפעיל את הלוח?",
    answer: "מסך טלוויזיה עם דפדפן (טלוויזיה חכמה, סטרימר או מחשב קטן) וחיבור אינטרנט. פותחים את קישור הלוח — וזה עובד.",
  },
  {
    question: "מה קורה אם האינטרנט נופל באמצע?",
    answer: "הלוח שומר עותק מקומי וממשיך להציג את הזמנים וההודעות האחרונים עד שהחיבור חוזר.",
  },
  {
    question: "כמה זמן לוקח להקים לוח חדש?",
    answer: "ההרשמה לוקחת דקה, והלוח נוצר עם מסכים מוכנים. הזנת הזמנים וההודעות של בית הכנסת — בדרך כלל פחות מחצי שעה.",
  },
  {
    question: "האם הזמנים מדויקים למיקום שלנו?",
    answer: "כן. מגדירים כתובת, קואורדינטות וגובה — וכל הזמנים מחושבים אסטרונומית לנקודה המדויקת, כולל עיגול לפי מנהג הקהילה.",
  },
];

export default async function LandingPage() {
  const payload = await getBoardPayload("demo-board");

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-[var(--board-gold)]">
              <Crown className="h-5 w-5" />
            </span>
            לוח בית הכנסת
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">תכונות</a>
            <a href="#how" className="transition-colors hover:text-foreground">איך זה עובד</a>
            <a href="#themes" className="transition-colors hover:text-foreground">עיצובים</a>
            <a href="#faq" className="transition-colors hover:text-foreground">שאלות</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              התחברות
            </Link>
            <Link href="/signup" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
              פתיחת חשבון
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:px-8 lg:pt-20">
        <div className="fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--board-gold-muted)] px-3.5 py-1.5 text-sm font-bold text-[oklch(0.45_0.08_86)]">
            <Sparkles className="h-4 w-4" />
            לוח דיגיטלי לבית הכנסת
          </p>
          <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight md:text-5xl xl:text-6xl">
            סוף לדפים המודבקים
            <span className="mt-1 block text-[oklch(0.45_0.08_86)]">בכניסה לבית הכנסת</span>
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            זמני תפילות שמתחשבים בשקיעה של היום, הודעות שיורדות לבד כשהן לא רלוונטיות,
            והלכה יומית שמתעדכנת כל בוקר. הגבאי מעדכן מהטלפון — הלוח מציג, תמיד נכון.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-lg font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              פתיחת לוח לבית הכנסת שלכם
            </Link>
            <Link
              href="/board/demo-board"
              target="_blank"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-border px-5 font-bold transition-colors hover:border-[var(--board-gold)]"
            >
              <MonitorPlay className="h-5 w-5" />
              צפייה בלוח לדוגמה
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">ללא התחייבות · מוכן לשידור תוך חצי שעה</p>
        </div>
        <div className="fade-up min-w-0" style={{ animationDelay: "120ms" }}>
          <HeroBoard payload={payload} />
          <p className="mt-3 text-center text-sm text-muted-foreground">זה לא צילום מסך — זה הלוח האמיתי, חי ומתחלף</p>
        </div>
      </section>

      <section className="border-y border-border bg-[oklch(0.965_0.006_92)] py-8">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-center text-sm font-bold text-muted-foreground">בתי כנסת ברחבי הארץ כבר מציגים איתנו</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["כאן יופיע הלוגו שלכם", "בקרוב: קהילות מספרות", "מקום שמור ללקוח", "מקום שמור ללקוח"].map((label, index) => (
              <div key={index} className="grid h-16 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">כל מה שגבאי צריך, בלי כאב ראש</h2>
          <p className="mt-3 text-lg text-muted-foreground">נבנה עם גבאים, בשביל גבאים. כל תכונה נולדה מבעיה אמיתית של לוח מודעות.</p>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="border-t border-border pt-5">
              <feature.icon className="h-6 w-6 text-[var(--accent)]" />
              <h3 className="mt-3 text-xl font-black">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[oklch(0.18_0.04_25)]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-center gap-10 lg:gap-16">
            <div className="flex-1 min-w-72">
              <span className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.5_0.22_25)] px-3.5 py-1.5 text-sm font-bold text-white">
                <ShieldAlert className="h-4 w-4" />
                פיצ׳ר מציל חיים
              </span>
              <h2 className="mt-5 text-3xl font-black leading-tight text-white md:text-4xl">
                התראות פיקוד העורף — ישירות על מסך בית הכנסת
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70">
                ברגע שמתרחשת אזעקה באזורכם, המסך נשתל אוטומטית: רקע אדום פועם, הוראות מקלט ושמות האזורים המוכרזים — בזמן אמת, ישירות מפיקוד העורף. ללא התערבות הגבאי, ללא עיכוב.
              </p>
              <ul className="mt-5 grid gap-2 text-white/60 text-sm">
                <li className="flex items-center gap-2"><span className="text-[oklch(0.65_0.22_25)]">✓</span> מחובר ל-API הרשמי של פיקוד העורף</li>
                <li className="flex items-center gap-2"><span className="text-[oklch(0.65_0.22_25)]">✓</span> סינון לפי עיר בית הכנסת</li>
                <li className="flex items-center gap-2"><span className="text-[oklch(0.65_0.22_25)]">✓</span> עדכון כל 5 שניות — ללא רענון</li>
                <li className="flex items-center gap-2"><span className="text-[oklch(0.65_0.22_25)]">✓</span> חוזר לתצוגה הרגילה אוטומטית כשהאזעקה מסתיימת</li>
              </ul>
            </div>
            <div className="flex-1 min-w-64">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.28_0.18_25)] aspect-video flex flex-col items-center justify-center text-center p-8 shadow-2xl">
                <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-white/10 ring-4 ring-white/20">
                  <ShieldAlert className="h-10 w-10 text-white" strokeWidth={1.25} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50">פיקוד העורף</p>
                <p className="mt-2 text-3xl font-black text-white leading-tight">ירי רקטות וטילים</p>
                <p className="mt-3 text-lg font-bold text-white/80">היכנסו למרחב המוגן מיד</p>
                <p className="mt-4 text-sm text-white/40">צפת · קרית שמונה · מעלות</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-border bg-[oklch(0.965_0.006_92)]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">שלושה צעדים ומשדרים</h2>
          </div>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="relative pr-14">
                <span className="absolute right-0 top-0 grid h-10 w-10 place-items-center rounded-full bg-primary font-black text-[var(--board-gold)]">
                  {index + 1}
                </span>
                <h3 className="text-xl font-black">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="themes" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">תפאורה שמכבדת את המקום</h2>
          <p className="mt-3 text-lg text-muted-foreground">עשרים וחמישה עיצובים מלכותיים: חמישה מוטיבים בכל אחת מחמש משפחות צבע. בוחרים תפאורה לכל מסך בנפרד.</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {screenBackgrounds.map((variant) => (
            <figure key={variant} className="group">
              <div className={`board-theme-${variant} aspect-video rounded-lg border border-border bg-cover bg-center shadow-[inset_0_0_0_1px_oklch(0.79_0.1_86/0.4)] transition-transform group-hover:-translate-y-1`} />
              <figcaption className="mt-2 text-center text-sm font-bold text-muted-foreground">{screenBackgroundLabels[variant]}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[oklch(0.965_0.006_92)]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">קהילות מספרות</h2>
            <p className="mt-3 text-lg text-muted-foreground">כאן יופיעו בקרוב תמונות וסיפורים מבתי כנסת שכבר משדרים.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="rounded-xl border border-dashed border-border bg-background/60 p-6">
                <Quote className="h-5 w-5 text-[var(--board-gold-muted)]" />
                <div className="mt-4 grid gap-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-4/5 rounded bg-muted" />
                  <div className="h-3 w-3/5 rounded bg-muted" />
                </div>
                <p className="mt-5 text-sm text-muted-foreground">מקום שמור להמלצה ותמונה מבית הכנסת שלכם</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
        <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">שאלות נפוצות</h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black">
                {faq.question}
                <span className="text-2xl font-normal text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-[65ch] leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="board-shell board-theme-parochet relative overflow-hidden text-board-foreground">
        <div className="relative mx-auto grid max-w-7xl place-items-center px-5 py-24 text-center lg:px-8">
          <Crown className="h-10 w-10 text-[var(--board-gold)]" aria-hidden="true" />
          <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
            הלוח הבא שהקהילה שלכם תראה — יכול להיות מוכן עוד היום
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-md bg-[var(--board-gold)] px-7 text-lg font-black text-[var(--board)] transition-transform hover:-translate-y-0.5"
            >
              פתיחת חשבון חינם
            </Link>
            <Link
              href="/board/demo-board"
              target="_blank"
              className="inline-flex h-12 items-center rounded-md border border-[var(--board-gold-muted)] px-6 font-bold text-board-foreground transition-colors hover:border-[var(--board-gold)]"
            >
              צפייה בלוח לדוגמה
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground lg:px-8">
          <p className="flex items-center gap-2 font-bold">
            <Crown className="h-4 w-4 text-[var(--accent)]" />
            לוח בית הכנסת
          </p>
          <div className="flex gap-5">
            <Link href="/login" className="transition-colors hover:text-foreground">התחברות</Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">פתיחת חשבון</Link>
            <Link href="/board/demo-board" target="_blank" className="transition-colors hover:text-foreground">לוח לדוגמה</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
