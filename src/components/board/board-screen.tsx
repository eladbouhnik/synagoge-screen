"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import type { BoardPayload, Screen } from "@/types/domain";
import { addMinutes, formatDate, formatTime, isActiveDateRange, parseLocalTime } from "@/lib/utils";
import { getDailyZmanimForSynagogue, getZmanByKey } from "@/lib/zmanim/engine";
import { getHebrewCalendarSummary } from "@/lib/zmanim/hebrewCalendar";
import { resolvePrayerTimes } from "@/lib/zmanim/resolvePrayerTime";
import type { DailyLearningItem } from "@/lib/halacha/daily-learning";
import { matchesSchedule } from "@/lib/schedule/rules";

interface BoardScreenProps {
  payload: BoardPayload;
  screen: Screen;
}

const labels: Record<string, string> = {
  sunrise: "זריחה",
  sofZmanShemaGra: "סוף זמן שמע",
  sofZmanTfilaGra: "סוף זמן תפילה",
  chatzot: "חצות",
  minchaGedola: "מנחה גדולה",
  minchaKetana: "מנחה קטנה",
  plagHamincha: "פלג המנחה",
  sunset: "שקיעה",
  tzet: "צאת הכוכבים",
  candleLighting: "הדלקת נרות",
};

export function BoardScreen({ payload, screen }: BoardScreenProps) {
  const [now] = useState(() => new Date());
  const zmanim = useMemo(() => getDailyZmanimForSynagogue(payload.synagogue, now), [payload.synagogue, now]);
  const hebrew = useMemo(() => getHebrewCalendarSummary(now), [now]);
  const [dailyLearning, setDailyLearning] = useState<DailyLearningItem[]>([]);

  useEffect(() => {
    let current = true;
    fetch("/api/daily-learning")
      .then((response) => response.json() as Promise<{ items?: DailyLearningItem[] }>)
      .then((data) => { if (current) setDailyLearning(data.items ?? []); })
      .catch(() => { if (current) setDailyLearning([]); });
    return () => { current = false; };
  }, []);

  if (screen.type === "tfilot") {
    const resolved = resolvePrayerTimes(payload.prayerTimes, payload.synagogue, now, payload.settings.zman_rounding);
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} subtitle={`${formatDate(now, payload.synagogue.timezone)} · ${hebrew.hebrewDate}`} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {resolved.map((item) => (
            <div key={item.source.id} className="board-panel p-7">
              <p className="text-3xl text-board-foreground/70">{item.label}</p>
              <p className="board-grand-time mt-4 whitespace-nowrap text-5xl font-black leading-none xl:text-7xl">{formatTime(item.resolvedAt, payload.synagogue.timezone)}</p>
              <p className="mt-4 text-2xl text-board-foreground/55">מניין {item.source.minyan_number}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (screen.type === "zmanei_hayom") {
    const entries = Object.entries(zmanim).filter(([key, value]) => key in labels && value instanceof Date) as [keyof typeof labels, Date][];
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} subtitle={[hebrew.hebrewDate, hebrew.parsha, hebrew.yomTov].filter(Boolean).join(" · ")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {entries.map(([key, value]) => (
            <div key={key} className="board-panel p-5">
              <p className="text-2xl text-board-foreground/65">{labels[key]}</p>
              <p className="board-grand-time mt-2 whitespace-nowrap text-4xl font-black xl:text-5xl">{formatTime(value, payload.synagogue.timezone)}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (screen.type === "messages") {
    const messages = payload.messages.filter((message) => message.is_active && isActiveDateRange(message.start_date, message.end_date, now));
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} />
        <div className="grid gap-5 lg:grid-cols-2">
          {messages.map((message) => (
            <article key={message.id} className="board-panel p-8">
              <h3 className="text-5xl font-black">{message.title}</h3>
              <p className="mt-5 text-4xl leading-tight text-board-foreground/78">{message.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (screen.type === "shiurim") {
    return (
      <ListScreen
        title={screen.title}
        items={payload.shiurim.filter((shiur) => matchesSchedule(shiur, now, payload.synagogue.timezone)).map((shiur) => {
          const time = shiur.time_mode === "fixed" && shiur.fixed_time
            ? parseLocalTime(now, shiur.fixed_time, payload.synagogue.timezone)
            : addMinutes(getZmanByKey(zmanim, shiur.relative_to) ?? now, shiur.offset_minutes);
          return {
            id: shiur.id,
            title: shiur.title,
            detail: `${shiur.rabbi_name} · ${formatTime(time, payload.synagogue.timezone)} · ${shiur.duration_minutes} דקות`,
          };
        })}
      />
    );
  }

  if (screen.type === "iluy_neshama") {
    return (
      <ListScreen
        title={screen.title}
        items={payload.iluyNeshama.map((item) => ({
          id: item.id,
          title: item.deceased_name,
          detail: `${item.hebrew_death_date}${item.donor_name ? ` · ${item.donor_name}` : ""}`,
        }))}
      />
    );
  }

  if (screen.type === "halachot") {
    const item = payload.halachot[Math.floor(now.getDate() % Math.max(payload.halachot.length, 1))];
    const automatic = dailyLearning[Math.floor(now.getDate() % Math.max(dailyLearning.length, 1))];
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} subtitle={automatic?.source ?? item?.category} />
        <p className="board-grand-time max-w-5xl text-6xl font-black leading-tight">{automatic?.title ?? item?.body ?? "אין הלכה נבחרת להצגה"}</p>
        {automatic ? <p className="text-2xl text-board-foreground/60">מקור מתעדכן אוטומטית, Hebcal</p> : null}
      </section>
    );
  }

  if (screen.type === "parnasim") {
    return <ListScreen title={screen.title} items={payload.parnasim.map((item) => ({ id: item.id, title: item.parnas_name, detail: `${item.blessing} · ${item.period}` }))} />;
  }

  if (screen.type === "birthdays") {
    return <ListScreen title={screen.title} items={payload.congregants.map((item) => ({ id: item.id, title: item.full_name, detail: item.hebrew_birth_date ?? item.gregorian_birth_date ?? "" }))} />;
  }

  return (
    <section className="grid place-items-center text-center">
      <div>
        <p className="board-grand-time text-9xl font-black">{new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="mt-6 text-5xl text-board-foreground/70">{formatDate(now, payload.synagogue.timezone)}</p>
        <p className="mt-3 text-4xl text-board-foreground/60">{hebrew.hebrewDate}</p>
      </div>
    </section>
  );
}

function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div className="board-screen-title">
      <div className="board-screen-title-mark" aria-hidden="true"><Crown /></div>
      <h2 className="board-grand-time text-5xl font-black leading-none md:text-8xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-3xl text-board-foreground/62">{subtitle}</p> : null}
    </div>
  );
}

function ListScreen({ title, items }: { title: string; items: { id: string; title: string; detail: string }[] }) {
  return (
    <section className="grid content-center gap-8">
      <ScreenTitle title={title} />
      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="board-panel p-7">
            <h3 className="text-5xl font-black">{item.title}</h3>
            <p className="mt-3 text-3xl text-board-foreground/65">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
