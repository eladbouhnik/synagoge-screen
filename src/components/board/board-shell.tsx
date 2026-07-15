"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BoardPayload, Screen } from "@/types/domain";
import { getVisibleScreens, getNextScreenIndex } from "@/lib/rotation/rotation";
import { BoardScreen } from "./board-screen";
import { resolvePrayerTimes } from "@/lib/zmanim/resolvePrayerTime";
import { getDailyZmanimForSynagogue, getZmanByKey } from "@/lib/zmanim/engine";
import { addMinutes, parseLocalTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface BoardShellProps {
  boardKey: string;
  initialPayload: BoardPayload;
}

const cacheKey = (boardKey: string) => `synagogue-board:${boardKey}`;

export function BoardShell({ boardKey, initialPayload }: BoardShellProps) {
  const [payload, setPayload] = useState<BoardPayload>(() => {
    if (typeof window === "undefined") return initialPayload;
    const cached = window.localStorage.getItem(cacheKey(boardKey));
    return cached ? (JSON.parse(cached) as BoardPayload) : initialPayload;
  });
  const [now, setNow] = useState(() => new Date());
  const [index, setIndex] = useState(0);
  const [lastSync, setLastSync] = useState(initialPayload.generatedAt);
  const screens = useMemo(() => getVisibleScreens(payload.screens), [payload.screens]);
  const currentScreen = screens[index] ?? screens[0];
  const lockedScreen = useMemo(() => getLockedScreen(payload, screens, now), [now, payload, screens]);
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
    channel?.addEventListener("message", refresh);
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
    <main className="board-shell min-h-screen overflow-hidden text-board-foreground">
      <div className="flex min-h-screen flex-col p-[3vw]">
        <header className="flex items-start justify-between gap-6 border-b border-board-foreground/15 pb-5">
          <div>
            <p className="text-2xl text-board-foreground/65">{payload.synagogue.address}</p>
            <h1 className="mt-1 text-5xl font-black leading-none md:text-7xl">{payload.synagogue.name}</h1>
          </div>
          <div className="text-left text-board-foreground/70">
            <p>סנכרון אחרון</p>
            <p>{new Date(lastSync).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </header>
        <div className="grid flex-1 place-items-stretch py-8">
          <BoardScreen payload={payload} screen={displayScreen as Screen} />
        </div>
        <footer className="flex items-center justify-between border-t border-board-foreground/15 pt-4 text-2xl text-board-foreground/70">
          <span>{payload.synagogue.donor_dedication}</span>
          <span>{index + 1}/{screens.length}</span>
        </footer>
      </div>
    </main>
  );
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
    if (!shiur.is_active) return false;
    const start = shiur.time_mode === "fixed" && shiur.fixed_time
      ? parseLocalTime(now, shiur.fixed_time, payload.synagogue.timezone)
      : addMinutes(getZmanByKey(zmanim, shiur.relative_to) ?? now, shiur.offset_minutes);
    const end = addMinutes(start, shiur.duration_minutes);
    return start.getTime() <= now.getTime() && now.getTime() <= end.getTime();
  });

  return activeShiur ? clockScreen : null;
}
