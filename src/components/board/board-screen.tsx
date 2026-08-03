"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import type { BoardPayload, Screen } from "@/types/domain";
import { addMinutes, formatDate, formatTime, parseLocalTime } from "@/lib/utils";
import { isMessageVisible, sortMessagesByUrgency } from "@/lib/messages/visibility";
import { getDailyZmanimForSynagogue, getZmanByKey } from "@/lib/zmanim/engine";
import { getZmanDisplayEntries } from "@/lib/zmanim/displayEntries";
import { getHebrewCalendarSummary } from "@/lib/zmanim/hebrewCalendar";
import { resolvePrayerTimes } from "@/lib/zmanim/resolvePrayerTime";
import { pickDailyLearning, type DailyLearningItem } from "@/lib/halacha/daily-learning";
import { matchesSchedule } from "@/lib/schedule/rules";
import { isComposedScreen } from "@/lib/board/screen-config";
import { AutoScrollText } from "./auto-scroll-text";
import { ComposedScreen } from "./composed-screen";

interface BoardScreenProps {
  payload: BoardPayload;
  screen: Screen;
  now: Date;
  headerDateLine?: string | null;
  onScrollDuration?: (seconds: number | null) => void;
}

export function BoardScreen({ payload, screen, now, headerDateLine, onScrollDuration }: BoardScreenProps) {
  const zmanim = useMemo(
    () => getDailyZmanimForSynagogue(payload.synagogue, now, payload.settings.zmanim_opinions),
    [payload.synagogue, payload.settings.zmanim_opinions, now],
  );
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

  if (isComposedScreen(screen)) {
    return (
      <ComposedScreen
        payload={payload}
        screen={screen}
        now={now}
        hebrewDate={hebrew.hebrewDate}
        yomTov={hebrew.yomTov}
        zmanim={zmanim}
        dailyLearning={dailyLearning}
        showDate={!headerDateLine}
      />
    );
  }

  if (screen.type === "tfilot") {
    const resolved = resolvePrayerTimes(payload.prayerTimes, payload.synagogue, now, payload.settings.zman_rounding, payload.settings.zmanim_opinions);
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
    const entries = getZmanDisplayEntries(zmanim, now);
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} subtitle={[hebrew.hebrewDate, hebrew.parsha, hebrew.yomTov].filter(Boolean).join(" · ")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {entries.map((entry) => (
            <div key={entry.key} className="board-panel p-5">
              <p className="text-2xl text-board-foreground/65">{entry.label}</p>
              <p className="board-grand-time mt-2 whitespace-nowrap text-4xl font-black xl:text-5xl">{formatTime(entry.value, payload.synagogue.timezone)}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (screen.type === "messages") {
    const messages = sortMessagesByUrgency(
      payload.messages.filter((message) => isMessageVisible(message, now, payload.synagogue.timezone)),
    );
    return (
      <section className="grid content-center gap-8">
        <ScreenTitle title={screen.title} />
        <div className="grid gap-5 lg:grid-cols-2">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`board-panel p-8 ${message.urgency === "urgent" ? "message-urgent" : message.urgency === "important" ? "message-important" : ""}`}
            >
              {message.urgency === "urgent" ? <p className="message-urgent-badge">דחוף</p> : null}
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
    const eligibleHalachot = payload.halachot.filter((item) => item.is_selected && (!item.holiday_tag || item.holiday_tag === hebrew.yomTov));
    const item = eligibleHalachot[Math.floor(now.getDate() % Math.max(eligibleHalachot.length, 1))];
    const halachaMode = payload.settings.halacha_mode ?? "auto";
    // Auto mode prefers the daily-learning feed (manual as fallback if the fetch failed);
    // manual mode shows only the synagogue's own halachot.
    const automatic = halachaMode === "auto" ? pickDailyLearning(dailyLearning, payload.settings.halacha_auto_source) : undefined;
    const body = automatic ? automatic.body : item?.body;
    const heading = automatic ? `${automatic.source} · ${automatic.title}` : item?.category;
    return (
      <section className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-2">
        <ScreenTitle title={screen.title} subtitle={heading ?? undefined} tiny />
        {body ? (
          <AutoScrollText text={body} className="board-halacha-scroll" textClassName="board-grand-time text-3xl font-bold leading-snug" onScrollDuration={onScrollDuration} />
        ) : (
          <p className="board-grand-time max-w-5xl text-4xl font-black leading-tight">{automatic?.title ?? "אין הלכה נבחרת להצגה"}</p>
        )}
        {automatic ? <p className="text-lg text-board-foreground/60">מתעדכן אוטומטית מדי יום · מקור: ספריא</p> : null}
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

function ScreenTitle({ title, subtitle, compact, tiny }: { title: string; subtitle?: string | null; compact?: boolean; tiny?: boolean }) {
  const titleSize = tiny ? "text-xl md:text-2xl" : compact ? "text-3xl md:text-5xl" : "text-5xl md:text-8xl";
  const subtitleSize = tiny ? "text-base" : compact ? "text-xl" : "text-3xl";
  return (
    <div className="board-screen-title">
      <div className="board-screen-title-mark" aria-hidden="true"><Crown /></div>
      <h2 className={`board-grand-time font-black leading-none ${titleSize}`}>{title}</h2>
      {subtitle ? <p className={`mt-1 text-board-foreground/62 ${subtitleSize}`}>{subtitle}</p> : null}
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
