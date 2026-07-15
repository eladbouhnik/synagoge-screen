import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string | null | undefined, timeZone = "Asia/Jerusalem") {
  if (!date) return "--:--";

  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(value);
}

export function formatDate(date: Date | string, timeZone = "Asia/Jerusalem") {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(value);
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function parseLocalTime(date: Date, hhmm: string, timeZone = "Asia/Jerusalem") {
  const [hourPart, minutePart] = hhmm.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .split("-");

  const [year, month, day] = dateParts.map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 3, minute, 0));
}

export function isActiveDateRange(startDate?: string | null, endDate?: string | null, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return (!startDate || startDate <= today) && (!endDate || today <= endDate);
}
