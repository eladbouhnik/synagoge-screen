"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crown } from "lucide-react";
import type { BoardPayload, HeaderDateVariant, Screen } from "@/types/domain";
import {
  ALERT_POLL_MS,
  CLIENT_ALERT_TIMEOUT_MS,
  nextVisibleAlertState,
  preserveVisibleAlertState,
  type ActiveAlert,
  type VisibleAlert,
} from "@/lib/alerts";
import { BoardFrame } from "./board-frame";
import { YahrzeitQrBadge } from "./yahrzeit-qr-badge";
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
  /** Freezes the board's clock to this instant instead of the real time — used by the admin time-travel simulator. */
  nowOverride?: Date;
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

export function BoardShell({ boardKey, initialPayload, disableLocks = false, nowOverride }: BoardShellProps) {
  const searchParams = useSearchParams();
  const alertParam = searchParams.get("alert");
  const [payload, setPayload] = useState<BoardPayload>(() => {
    if (typeof window === "undefined") return initialPayload;
    const cached = window.localStorage.getItem(cacheKey(boardKey));
    return applyDemoOverrides(cached ? (JSON.parse(cached) as BoardPayload) : initialPayload);
  });
  const [internalNow, setInternalNow] = useState(() => new Date());
  const now = nowOverride ?? internalNow;
  const [index, setIndex] = useState(0);
  const [lastSync, setLastSync] = useState(initialPayload.generatedAt);
  const [visibleAlert, setVisibleAlert] = useState<VisibleAlert | null>(null);
  const [halachaScrollDurationState, setHalachaScrollDurationState] = useState<{ key: string; durationSeconds: number | null } | null>(null);
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
  const alertCity = payload.settings.alert_city?.trim() ?? "";
  const activeVisibleAlert = alertCity && visibleAlert?.configuredCity === alertCity ? visibleAlert : null;
  const alarmAlert = alertParam === "local" ? TEST_ALERT : activeVisibleAlert?.isLocal ? activeVisibleAlert.alert : null;
  const bannerAlert = alertParam === "remote" ? TEST_ALERT : alertParam !== "local" && activeVisibleAlert && !activeVisibleAlert.isLocal ? activeVisibleAlert.alert : null;

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
  const scrollDurationKey = `${currentScreen?.id ?? "none"}:${lockedScreen?.id ?? "none"}`;
  const halachaScrollDuration = halachaScrollDurationState?.key === scrollDurationKey
    ? halachaScrollDurationState.durationSeconds
    : null;

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
    if (nowOverride) return;
    const timer = window.setInterval(() => setInternalNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [nowOverride]);

  useEffect(() => {
    if (nowOverride) return;
    const timer = window.setInterval(refresh, 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [nowOverride, refresh]);

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
    if (!alertCity) return;

    let timeout: number | undefined;
    let cancelled = false;
    let controller: AbortController | null = null;

    async function checkAlert(): Promise<void> {
      const activeController = new AbortController();
      controller = activeController;
      const abortTimer = window.setTimeout(() => activeController.abort(), CLIENT_ALERT_TIMEOUT_MS);
      const checkedAt = Date.now();
      try {
        const res = await fetch("/api/alerts", { cache: "no-store", signal: activeController.signal });
        if (!res.ok) throw new Error("Failed to check Home Front Command alerts.");
        const alert = (await res.json()) as ActiveAlert | null;
        if (!cancelled) {
          setVisibleAlert((current) => nextVisibleAlertState(current, alert, alertCity, checkedAt));
        }
      } catch {
        if (!cancelled) {
          setVisibleAlert((current) => preserveVisibleAlertState(current, Date.now(), alertCity));
        }
      } finally {
        window.clearTimeout(abortTimer);
        if (!cancelled) {
          timeout = window.setTimeout(() => void checkAlert(), ALERT_POLL_MS);
        }
      }
    }

    void checkAlert();
    return () => {
      cancelled = true;
      controller?.abort();
      if (timeout) window.clearTimeout(timeout);
    };
  }, [alertCity]);

  if (!displayScreen) {
    return (
      <main className="board-shell flex h-screen items-center justify-center text-board-foreground">
        <p className="text-4xl font-black">אין מסכים פעילים להצגה</p>
      </main>
    );
  }

  return (
    <main className={`board-shell board-theme-${getBoardTheme(displayScreen as Screen)} relative h-screen overflow-hidden text-board-foreground`}>
      {alarmAlert && (
        <AlarmOverlay
          title={alarmAlert.title}
          desc={alarmAlert.desc}
          cities={alarmAlert.data}
        />
      )}
      {bannerAlert && (
        <AlertBanner
          title={bannerAlert.title}
          cities={bannerAlert.data}
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
        footerStart={<YahrzeitQrBadge boardKey={boardKey} />}
        footerEnd={<span>{index + 1}/{screens.length}</span>}
      >
        <BoardScreen
          payload={payload}
          screen={displayScreen as Screen}
          now={now}
          headerDateLine={headerDateLine}
          onScrollDuration={
            scrollUntilDone && !lockedScreen
              ? (durationSeconds) => setHalachaScrollDurationState({ key: scrollDurationKey, durationSeconds })
              : undefined
          }
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

  const prayers = resolvePrayerTimes(payload.prayerTimes, payload.synagogue, now, payload.settings.zman_rounding, payload.settings.zmanim_opinions);
  const hasActivePrayerWindow = prayers.some((item) => {
    if (!item.resolvedAt) return false;
    const start = addMinutes(item.resolvedAt, -5).getTime();
    const end = addMinutes(item.resolvedAt, 20).getTime();
    return start <= now.getTime() && now.getTime() <= end;
  });

  if (hasActivePrayerWindow) return clockScreen;

  const zmanim = getDailyZmanimForSynagogue(payload.synagogue, now, payload.settings.zmanim_opinions);
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
