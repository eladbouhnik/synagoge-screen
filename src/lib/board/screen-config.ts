import { getDayType } from "@/lib/schedule/rules";
import type { Json, Screen, ScreenType } from "@/types/domain";

export const screenBackgrounds = [
  "parochet",
  "arches",
  "stars",
  "mosaic",
  "pomegranates",
  "ruby-parochet",
  "ruby-arches",
  "ruby-stars",
  "ruby-mosaic",
  "ruby-pomegranates",
  "emerald-parochet",
  "emerald-arches",
  "emerald-stars",
  "emerald-mosaic",
  "emerald-pomegranates",
  "ivory-parochet",
  "ivory-arches",
  "ivory-stars",
  "ivory-mosaic",
  "ivory-pomegranates",
  "teal-parochet",
  "teal-arches",
  "teal-stars",
  "teal-mosaic",
  "teal-pomegranates",
] as const;
export type ScreenBackground = (typeof screenBackgrounds)[number];

export const screenBackgroundLabels: Record<ScreenBackground, string> = {
  parochet: "כחול מלכותי - פרוכת וכתר",
  arches: "כחול מלכותי - היכל וקשתות",
  stars: "כחול מלכותי - שמיים וכוכבים",
  mosaic: "כחול מלכותי - פסיפס ספרי",
  pomegranates: "כחול מלכותי - רימונים ופרוכת",
  "ruby-parochet": "אודם - פרוכת וכתר",
  "ruby-arches": "אודם - היכל וקשתות",
  "ruby-stars": "אודם - שמיים וכוכבים",
  "ruby-mosaic": "אודם - פסיפס ספרי",
  "ruby-pomegranates": "אודם - רימונים ופרוכת",
  "emerald-parochet": "אזמרגד - פרוכת וכתר",
  "emerald-arches": "אזמרגד - היכל וקשתות",
  "emerald-stars": "אזמרגד - שמיים וכוכבים",
  "emerald-mosaic": "אזמרגד - פסיפס ספרי",
  "emerald-pomegranates": "אזמרגד - רימונים ופרוכת",
  "ivory-parochet": "שנהב - פרוכת וכתר",
  "ivory-arches": "שנהב - היכל וקשתות",
  "ivory-stars": "שנהב - שמיים וכוכבים",
  "ivory-mosaic": "שנהב - פסיפס ספרי",
  "ivory-pomegranates": "שנהב - רימונים ופרוכת",
  "teal-parochet": "טורקיז - פרוכת וכתר",
  "teal-arches": "טורקיז - היכל וקשתות",
  "teal-stars": "טורקיז - שמיים וכוכבים",
  "teal-mosaic": "טורקיז - פסיפס ספרי",
  "teal-pomegranates": "טורקיז - רימונים ופרוכת",
};

export const screenLayouts = ["single", "spotlight", "poster", "banner", "sidebar", "feature", "split", "two-column", "three-column", "four-grid", "ledger"] as const;
export type ScreenLayout = (typeof screenLayouts)[number];

export const screenContentBlocks = [
  "tfilot",
  "zmanei_hayom",
  "messages",
  "shiurim",
  "iluy_neshama",
  "halachot",
  "parnasim",
  "birthdays",
  "clock",
] as const;
export type ScreenContentBlock = (typeof screenContentBlocks)[number];

export const specialDays = ["all", "weekday", "shabbat", "holiday"] as const;
export type SpecialDay = (typeof specialDays)[number];

export interface ScreenDesignConfig {
  background_variant: ScreenBackground;
  layout: ScreenLayout;
  content_blocks: ScreenContentBlock[];
  special_day: SpecialDay;
}

const defaultBackgrounds: Record<ScreenType, ScreenBackground> = {
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

function includes<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

function rawConfig(screen: Screen): Record<string, unknown> {
  return screen.config as Record<string, Json> as Record<string, unknown>;
}

export function getScreenDesignConfig(screen: Screen): ScreenDesignConfig {
  const config = rawConfig(screen);
  const contentBlocks = Array.isArray(config.content_blocks)
    ? config.content_blocks.filter((value): value is ScreenContentBlock => includes(screenContentBlocks, value))
    : [];

  return {
    background_variant: includes(screenBackgrounds, config.background_variant) ? config.background_variant : defaultBackgrounds[screen.type],
    layout: includes(screenLayouts, config.layout) ? config.layout : "feature",
    content_blocks: contentBlocks.length ? contentBlocks : [screen.type],
    special_day: includes(specialDays, config.special_day) ? config.special_day : "all",
  };
}

export function isComposedScreen(screen: Screen) {
  return Array.isArray(rawConfig(screen).content_blocks);
}

export function isScreenActiveForDay(screen: Screen, date = new Date()) {
  const specialDay = getScreenDesignConfig(screen).special_day;
  if (specialDay === "all") return true;
  if (specialDay === "shabbat") return date.getDay() === 5 || date.getDay() === 6;
  return getDayType(date) === specialDay;
}
