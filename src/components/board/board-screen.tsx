"use client";

import { useMemo, useState } from "react";
import type { BoardPayload, Screen } from "@/types/domain";
import { formatDate, formatTime, isActiveDateRange } from "@/lib/utils";
import { getDailyZmanimForSynagogue } from "@/lib/zmanim/engine";
import { getHebrewCalendarSummary } from "@/lib/zmanim/hebrewCalendar";
import { resolvePrayerTimes } from "@/lib/zmanim/resolvePrayerTime";

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

  if (screen.type === "tfilot") {
    const resolved = resolvePrayerTimes(payload.prayerTimes, payload.synagogue, now, payload.settings.zman_rounding);
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} subtitle={`${formatDate(now, payload.synagogue.timezone)} · ${hebrew.hebrewDate}`} />
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {resolved.map((item) => (
            <div key={item.source.id} className="rounded-lg border border-board-foreground/15 bg-board-foreground/8 p-7">
              <p className="text-3xl text-board-foreground/70">{item.label}</p>
              <p className="mt-4 text-7xl font-black leading-none">{formatTime(item.resolvedAt, payload.synagogue.timezone)}</p>
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {entries.map(([key, value]) => (
            <div key={key} className="rounded-lg border border-board-foreground/15 p-5">
              <p className="text-2xl text-board-foreground/65">{labels[key]}</p>
              <p className="mt-2 text-5xl font-black">{formatTime(value, payload.synagogue.timezone)}</p>
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
            <article key={message.id} className="rounded-lg border border-board-foreground/15 bg-board-foreground/8 p-8">
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
        items={payload.shiurim.map((shiur) => ({
          id: shiur.id,
          title: shiur.title,
          detail: `${shiur.rabbi_name} · ${shiur.fixed_time ?? "לפי זמן היום"} · ${shiur.duration_minutes} דקות`,
        }))}
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
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} subtitle={item?.category} />
        <p className="max-w-5xl text-6xl font-black leading-tight text-board-foreground/90">{item?.body}</p>
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
        <p className="text-9xl font-black">{new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="mt-6 text-5xl text-board-foreground/70">{formatDate(now, payload.synagogue.timezone)}</p>
        <p className="mt-3 text-4xl text-board-foreground/60">{hebrew.hebrewDate}</p>
      </div>
    </section>
  );
}

function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div>
      <h2 className="text-7xl font-black leading-none md:text-8xl">{title}</h2>
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
          <article key={item.id} className="rounded-lg border border-board-foreground/15 p-7">
            <h3 className="text-5xl font-black">{item.title}</h3>
            <p className="mt-3 text-3xl text-board-foreground/65">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
