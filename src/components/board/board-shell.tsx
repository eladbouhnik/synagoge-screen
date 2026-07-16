"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, Star } from "lucide-react";
import type { BoardPayload, Screen } from "@/types/domain";
import { getVisibleScreens, getNextScreenIndex } from "@/lib/rotation/rotation";
import { BoardScreen } from "./board-screen";
import { resolvePrayerTimes } from "@/lib/zmanim/resolvePrayerTime";
import { getDailyZmanimForSynagogue, getZmanByKey } from "@/lib/zmanim/engine";
import { addMinutes, parseLocalTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { matchesSchedule } from "@/lib/schedule/rules";

interface BoardShellProps {
  boardKey: string;
  initialPayload: BoardPayload;
  disableLocks?: boolean;
}

const cacheKey = (boardKey: string) => `synagogue-board:${boardKey}`;

const themes = ["parochet", "arches", "stars", "mosaic", "pomegranates"] as const;
type BoardTheme = (typeof themes)[number];

const defaultThemes: Record<Screen["type"], BoardTheme> = {
  tfilot: "parochet",
  zmanei_hayom: "arches",
  messages: "mosaic",
  shiurim: "stars",
  iluy_neshama: "pomegranates",
  halachot: "mosaic",
  parnasim: "arches",
  birthdays: "pomegranates",
  clock: "stars",
};

export function BoardShell({ boardKey, initialPayload, disableLocks = false }: BoardShellProps) {
  const [payload, setPayload] = useState<BoardPayload>(() => {
    if (typeof window === "undefined") return initialPayload;
    const cached = window.localStorage.getItem(cacheKey(boardKey));
    return applyDemoOverrides(cached ? (JSON.parse(cached) as BoardPayload) : initialPayload);
  });
  const [now, setNow] = useState(() => new Date());
  const [index, setIndex] = useState(0);
  const [lastSync, setLastSync] = useState(initialPayload.generatedAt);
  const screens = useMemo(() => getVisibleScreens(payload.screens), [payload.screens]);
  const currentScreen = screens[index] ?? screens[0];
  const lockedScreen = useMemo(() => disableLocks ? null : getLockedScreen(payload, screens, now), [disableLocks, now, payload, screens]);
  const displayScreen = lockedScreen ?? currentScreen;

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/board/${boardKey}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to refresh board payload.");
      const nextPayload = (await response.json()) as BoardPayload;
      setPayload(nextPayload);
      setLastSync(nextPayload.generatedAt);
      localStorage.setItem(cacheKey(boardKey), JSON.stringify(nextPayload));
    } catch {
      const cached = localStorage.getItem(cacheKey(boardKey));
      if (cached) {
        setPayload(JSON.parse(cached) as BoardPayload);
      }
    }
  }, [boardKey]);

  useEffect(() => {
    localStorage.setItem(cacheKey(boardKey), JSON.stringify(initialPayload));
  }, [boardKey, initialPayload]);

  useEffect(() => {
    if (lockedScreen) return;
    const duration = Math.max((currentScreen?.duration_seconds ?? payload.settings.default_screen_duration) * 1000, 4_000);
    const timer = window.setTimeout(() => setIndex((value) => getNextScreenIndex(value, screens)), duration);
    return () => window.clearTimeout(timer);
  }, [currentScreen, lockedScreen, payload.settings.default_screen_duration, screens]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(refresh, 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    try {
      const supabase = createClient();
      const channel = supabase.channel(`board-live:${payload.synagogue.id}`);
      const tables = [
        "board_settings",
        "screens",
        "messages",
        "prayer_times",
        "iluy_neshama",
        "shiurim",
        "halachot",
        "parnasim",
        "congregants",
        "synagogues",
      ];

      tables.forEach((table) => {
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter: table === "synagogues" ? `id=eq.${payload.synagogue.id}` : `synagogue_id=eq.${payload.synagogue.id}` },
          () => {
            void refresh();
          },
        );
      });

      void channel.subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    } catch {
      return;
    }
  }, [payload.synagogue.id, refresh]);

  useEffect(() => {
    const channel = "BroadcastChannel" in window ? new BroadcastChannel(`board:${boardKey}`) : null;
    channel?.addEventListener("message", () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setPayload((current) => applyDemoOverrides(current));
        return;
      }
      void refresh();
    });
    return () => channel?.close();
  }, [boardKey, refresh]);

  if (!displayScreen) {
    return (
      <main className="board-shell flex min-h-screen items-center justify-center text-board-foreground">
        <p className="text-4xl font-black">אין מסכים פעילים להצגה</p>
      </main>
    );
  }

  return (
    <main className={`board-shell board-theme-${getBoardTheme(displayScreen as Screen)} relative min-h-screen overflow-hidden text-board-foreground`}>
      <div className="board-ornament board-ornament-right" aria-hidden="true"><Star /></div>
      <div className="board-ornament board-ornament-left" aria-hidden="true"><Star /></div>
      <div className="board-frame relative flex min-h-screen flex-col p-[3vw]">
        <header className="flex items-start justify-between gap-6 border-b border-[color:var(--board-gold-muted)] pb-5">
          <div>
            <p className="board-kicker text-2xl">{payload.synagogue.address}</p>
            <div className="board-title-lockup mt-1">
              <Crown className="board-title-crown" aria-hidden="true" />
              <h1 className="text-4xl font-black leading-none md:text-7xl">{payload.synagogue.name}</h1>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left text-board-foreground/70">
            <Crown className="mt-1 h-7 w-7 text-[color:var(--board-gold)]" aria-hidden="true" />
            <div>
            <p>סנכרון אחרון</p>
            <p>{new Date(lastSync).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        </header>
        <div className="grid flex-1 place-items-stretch py-8">
          <BoardScreen payload={payload} screen={displayScreen as Screen} />
        </div>
        <footer className="flex items-center justify-between border-t border-[color:var(--board-gold-muted)] pt-4 text-2xl text-board-foreground/70">
          <span>{payload.synagogue.donor_dedication}</span>
          <span>{index + 1}/{screens.length}</span>
        </footer>
      </div>
    </main>
  );
}

function getBoardTheme(screen: Screen): BoardTheme {
  const configured = screen.config.background_variant;
  return typeof configured === "string" && themes.includes(configured as BoardTheme)
    ? configured as BoardTheme
    : defaultThemes[screen.type];
}

function readRows<T>(key: string, fallback: T[]) {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T[]) : fallback;
}

function applyDemoOverrides(payload: BoardPayload): BoardPayload {
  if (typeof window === "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL) return payload;

  return {
    ...payload,
    screens: readRows("admin:screens", payload.screens),
    messages: readRows("admin:messages", payload.messages),
    prayerTimes: readRows("admin:prayer-times", payload.prayerTimes),
    shiurim: readRows("admin:shiurim", payload.shiurim),
    iluyNeshama: readRows("admin:iluy-neshama", payload.iluyNeshama),
    halachot: readRows("admin:halachot", payload.halachot),
    parnasim: readRows("admin:parnasim", payload.parnasim),
    congregants: readRows("admin:congregants", payload.congregants),
  };
}

function getLockedScreen(payload: BoardPayload, screens: Screen[], now: Date) {
  const clockScreen = screens.find((screen) => screen.type === "clock");
  if (!clockScreen) return null;

  const prayers = resolvePrayerTimes(payload.prayerTimes, payload.synagogue, now, payload.settings.zman_rounding);
  const hasActivePrayerWindow = prayers.some((item) => {
    if (!item.resolvedAt) return false;
    const start = addMinutes(item.resolvedAt, -5).getTime();
    const end = addMinutes(item.resolvedAt, 20).getTime();
    return start <= now.getTime() && now.getTime() <= end;
  });

  if (hasActivePrayerWindow) return clockScreen;

  const zmanim = getDailyZmanimForSynagogue(payload.synagogue, now);
  const activeShiur = payload.shiurim.some((shiur) => {
    if (!matchesSchedule(shiur, now, payload.synagogue.timezone)) return false;
    const start = shiur.time_mode === "fixed" && shiur.fixed_time
      ? parseLocalTime(now, shiur.fixed_time, payload.synagogue.timezone)
      : addMinutes(getZmanByKey(zmanim, shiur.relative_to) ?? now, shiur.offset_minutes);
    const end = addMinutes(start, shiur.duration_minutes);
    return start.getTime() <= now.getTime() && now.getTime() <= end.getTime();
  });

  return activeShiur ? clockScreen : null;
}
