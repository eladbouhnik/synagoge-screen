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

export function formatWeekday(date: Date | string, timeZone = "Asia/Jerusalem") {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("he-IL", { weekday: "long", timeZone }).format(value);
}

// Like formatDate, but without the weekday — for use alongside a separate weekday line.
export function formatGregorianDate(date: Date | string, timeZone = "Asia/Jerusalem") {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "long", year: "numeric", timeZone }).format(value);
}

export function formatLocalIsoDate(date: Date | string, timeZone = "Asia/Jerusalem") {
  const value = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
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
  const today = formatLocalIsoDate(now);
  return (!startDate || startDate <= today) && (!endDate || today <= endDate);
}
