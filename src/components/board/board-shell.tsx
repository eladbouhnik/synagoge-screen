"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crown } from "lucide-react";
import type { BoardPayload, HeaderDateVariant, Screen } from "@/types/domain";
import type { ActiveAlert } from "@/app/api/alerts/route";
import { BoardFrame } from "./board-frame";
import { getVisibleScreens, getNextScreenIndex } from "@/lib/rotation/rotation";
import { BoardScreen } from "./board-screen";
import { AlarmOverlay } from "./alarm-overlay";
import { AlertBanner } from "./alert-banner";
import { resolvePrayerTimes } from "@/lib/zmanim/resolvePrayerTime";
import { getDailyZmanimForSynagogue, getZmanByKey } from "@/lib/zmanim/engine";
import { getHebrewCalendarSummary } from "@/lib/zmanim/hebrewCalendar";
import { addMinutes, formatGregorianDate, formatWeekday, parseLocalTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { matchesSchedule } from "@/lib/schedule/rules";
import { getScreenDesignConfig, isScreenActiveForDay, type ScreenBackground } from "@/lib/board/screen-config";

interface BoardShellProps {
  boardKey: string;
  initialPayload: BoardPayload;
  disableLocks?: boolean;
}

const cacheKey = (boardKey: string) => `synagogue-board:v2:${boardKey}`;
const headerDateOrder: HeaderDateVariant[] = ["weekday", "gregorian", "hebrew", "parsha"];

const TEST_ALERT: ActiveAlert = {
  id: "test-alert",
  cat: "1",
  title: "ירי רקטות וטילים",
  data: ["תל אביב - יפו", "רמת גן", "בת ים"],
  desc: "היכנסו למרחב המוגן מיד",
};

export function BoardShell({ boardKey, initialPayload, disableLocks = false }: BoardShellProps) {
  const searchParams = useSearchParams();
  const alertParam = searchParams.get("alert");
  const [payload, setPayload] = useState<BoardPayload>(() => {
    if (typeof window === "undefined") return initialPayload;
    const cached = window.localStorage.getItem(cacheKey(boardKey));
    return applyDemoOverrides(cached ? (JSON.parse(cached) as BoardPayload) : initialPayload);
  });
  const [now, setNow] = useState(() => new Date());
  const [index, setIndex] = useState(0);
  const [lastSync, setLastSync] = useState(initialPayload.generatedAt);
  const [rawAlert, setRawAlert] = useState<ActiveAlert | null>(null);
  const [isLocalAlert, setIsLocalAlert] = useState(false);
  const [halachaScrollDuration, setHalachaScrollDuration] = useState<number | null>(null);
  const screens = useMemo(
    () => getVisibleScreens(payload.screens).filter((screen) => isScreenActiveForDay(screen, now)),
    [now, payload.screens],
  );
  const currentScreen = screens[index] ?? screens[0];
  const headerDateLine = useMemo(() => {
    const selected = payload.settings.header_date_display ?? [];
    if (!selected.length) return null;
    const hebrew = getHebrewCalendarSummary(now);
    const parts = headerDateOrder
      .filter((variant) => selected.includes(variant))
      .map((variant) => {
        if (variant === "weekday") return formatWeekday(now, payload.synagogue.timezone);
        if (variant === "gregorian") return formatGregorianDate(now, payload.synagogue.timezone);
        if (variant === "hebrew") return hebrew.hebrewDate;
        return hebrew.parsha;
      })
      .filter((part): part is string => Boolean(part));
    return parts.length ? parts.join(" · ") : null;
  }, [now, payload.settings.header_date_display, payload.synagogue.timezone]);
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

  const scrollUntilDone = currentScreen?.type === "halachot" && !!currentScreen?.config?.scroll_until_done;

  useEffect(() => {
    setHalachaScrollDuration(null);
  }, [currentScreen?.id, lockedScreen?.id]);

  useEffect(() => {
    if (lockedScreen) return;
    const normalMs = Math.max((currentScreen?.duration_seconds ?? payload.settings.default_screen_duration) * 1000, 4_000);
    const duration = scrollUntilDone && halachaScrollDuration !== null
      ? halachaScrollDuration * 1000 + 3_000
      : normalMs;
    const timer = window.setTimeout(() => setIndex((value) => getNextScreenIndex(value, screens)), duration);
    return () => window.clearTimeout(timer);
  }, [currentScreen, lockedScreen, scrollUntilDone, halachaScrollDuration, payload.settings.default_screen_duration, screens]);

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

  useEffect(() => {
    const cityStr = payload.settings.alert_city ?? "";

    function matchesCity(alert: ActiveAlert): boolean {
      if (!cityStr) return false;
      return alert.data.some((c) => c.includes(cityStr) || cityStr.includes(c));
    }

    async function checkAlert() {
      try {
        const res = await fetch("/api/alerts", { cache: "no-store" });
        const alert = (await res.json()) as ActiveAlert | null;
        setRawAlert(alert);
        setIsLocalAlert(alert ? matchesCity(alert) : false);
      } catch {
        setRawAlert(null);
        setIsLocalAlert(false);
      }
    }

    void checkAlert();
    const interval = window.setInterval(() => void checkAlert(), 5_000);
    return () => window.clearInterval(interval);
  }, [payload.settings.alert_city]);

  if (!displayScreen) {
    return (
      <main className="board-shell flex h-screen items-center justify-center text-board-foreground">
        <p className="text-4xl font-black">אין מסכים פעילים להצגה</p>
      </main>
    );
  }

  return (
    <main className={`board-shell board-theme-${getBoardTheme(displayScreen as Screen)} relative h-screen overflow-hidden text-board-foreground`}>
      {(alertParam === "local" || (rawAlert && isLocalAlert)) && (
        <AlarmOverlay
          title={(alertParam === "local" ? TEST_ALERT : rawAlert)!.title}
          desc={(alertParam === "local" ? TEST_ALERT : rawAlert)!.desc}
          cities={(alertParam === "local" ? TEST_ALERT : rawAlert)!.data}
        />
      )}
      {alertParam !== "local" && (alertParam === "remote" || (rawAlert && !isLocalAlert)) && (
        <AlertBanner
          title={(alertParam === "remote" ? TEST_ALERT : rawAlert)!.title}
          cities={(alertParam === "remote" ? TEST_ALERT : rawAlert)!.data}
        />
      )}
      <BoardFrame
        synagogue={payload.synagogue}
        frameClassName="h-full p-[3vw]"
        subheading={headerDateLine}
        headerEnd={
          <div className="flex items-start gap-3 text-left text-board-foreground/70">
            <Crown className="mt-1 h-7 w-7 text-[color:var(--board-gold)]" aria-hidden="true" />
            <div>
              <p>סנכרון אחרון</p>
              <p>{new Date(lastSync).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        }
        footerEnd={<span>{index + 1}/{screens.length}</span>}
      >
        <BoardScreen
          payload={payload}
          screen={displayScreen as Screen}
          now={now}
          headerDateLine={headerDateLine}
          onScrollDuration={scrollUntilDone && !lockedScreen ? setHalachaScrollDuration : undefined}
        />
      </BoardFrame>
    </main>
  );
}

function getBoardTheme(screen: Screen): ScreenBackground {
  return getScreenDesignConfig(screen).background_variant;
}

function readRows<T>(key: string, fallback: T[]) {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T[]) : fallback;
}

function readObject<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  return stored ? { ...fallback, ...(JSON.parse(stored) as Partial<T>) } : fallback;
}

function applyDemoOverrides(payload: BoardPayload): BoardPayload {
  if (typeof window === "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL) return payload;

  const storedScreens = readRows("admin:screens", payload.screens);

  return {
    ...payload,
    synagogue: readObject("admin:settings", payload.synagogue),
    settings: readObject("admin:board-settings", payload.settings),
    screens: storedScreens.map((screen) => {
      const template = payload.screens.find((candidate) => candidate.id === screen.id);
      return { ...screen, config: { ...template?.config, ...screen.config } };
    }),
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
