import { isActiveDateRange } from "@/lib/utils";
import type { Message } from "@/types/domain";

const urgencyRank: Record<string, number> = { urgent: 0, important: 1, regular: 2 };

function localMinutes(now: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isWithinShowWindow(showFrom: string | null, showUntil: string | null, now: Date, timezone: string): boolean {
  const from = showFrom ? parseTimeToMinutes(showFrom) : null;
  const until = showUntil ? parseTimeToMinutes(showUntil) : null;
  if (from === null && until === null) return true;

  const current = localMinutes(now, timezone);
  if (from !== null && until !== null) {
    // Overnight window (e.g. 20:00 -> 06:00) wraps past midnight.
    if (until < from) return current >= from || current <= until;
    return current >= from && current <= until;
  }
  if (from !== null) return current >= from;
  return current <= (until as number);
}

export function isMessageVisible(message: Message, now: Date, timezone: string): boolean {
  if (!message.is_active) return false;
  if (!isActiveDateRange(message.start_date, message.end_date, now)) return false;
  return isWithinShowWindow(message.show_from ?? null, message.show_until ?? null, now, timezone);
}

export function sortMessagesByUrgency(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) => (urgencyRank[a.urgency ?? "regular"] ?? 2) - (urgencyRank[b.urgency ?? "regular"] ?? 2),
  );
}
