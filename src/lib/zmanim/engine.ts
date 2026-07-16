import { getZmanimJson } from "kosher-zmanim";
import type { RelativeDay, RelativeZmanKey, RoundingMode, Synagogue } from "@/types/domain";
import { addMinutes } from "@/lib/utils";

export interface ZmanimInput {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  locationName?: string;
  date: Date;
  candleLightingMinutes: number;
}

export interface DailyZmanim {
  date: string;
  timezone: string;
  sunrise: Date | null;
  seaLevelSunrise: Date | null;
  sofZmanShemaGra: Date | null;
  sofZmanTfilaGra: Date | null;
  chatzot: Date | null;
  minchaGedola: Date | null;
  minchaKetana: Date | null;
  plagHamincha: Date | null;
  sunset: Date | null;
  seaLevelSunset: Date | null;
  tzet: Date | null;
  tzet72: Date | null;
  candleLighting: Date | null;
}

interface ZmanimJson {
  Zmanim: Record<string, string | null | undefined>;
}

const dayIndex: Record<RelativeDay, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  shabbat: 6,
};

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

export function getDailyZmanim(input: ZmanimInput): DailyZmanim {
  const json = getZmanimJson({
    date: input.date,
    timeZoneId: input.timezone,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    elevation: input.elevation,
    complexZmanim: true,
  }) as unknown as ZmanimJson;

  const sunset = toDate(json.Zmanim.Sunset ?? json.Zmanim.SeaLevelSunset);

  return {
    date: input.date.toISOString().slice(0, 10),
    timezone: input.timezone,
    sunrise: toDate(json.Zmanim.Sunrise),
    seaLevelSunrise: toDate(json.Zmanim.SeaLevelSunrise),
    sofZmanShemaGra: toDate(json.Zmanim.SofZmanShmaGRA),
    sofZmanTfilaGra: toDate(json.Zmanim.SofZmanTfilaGRA),
    chatzot: toDate(json.Zmanim.Chatzos),
    minchaGedola: toDate(json.Zmanim.MinchaGedola),
    minchaKetana: toDate(json.Zmanim.MinchaKetana),
    plagHamincha: toDate(json.Zmanim.PlagHamincha),
    sunset,
    seaLevelSunset: toDate(json.Zmanim.SeaLevelSunset),
    tzet: toDate(json.Zmanim.TzaisGeonim7Point083Degrees ?? json.Zmanim.Tzais),
    tzet72: toDate(json.Zmanim.Tzais72),
    candleLighting: sunset ? addMinutes(sunset, -input.candleLightingMinutes) : null,
  };
}

export function getDailyZmanimForSynagogue(synagogue: Synagogue, date = new Date()) {
  return getDailyZmanim({
    latitude: synagogue.latitude,
    longitude: synagogue.longitude,
    elevation: synagogue.elevation,
    timezone: synagogue.timezone,
    locationName: synagogue.name,
    date,
    candleLightingMinutes: synagogue.candle_lighting_minutes,
  });
}

export function getRelativeDate(date: Date, relativeDay: RelativeDay | null) {
  if (!relativeDay) return date;
  const current = date.getDay();
  const target = dayIndex[relativeDay];
  const result = new Date(date);
  result.setDate(date.getDate() + target - current);
  return result;
}

export function roundZman(date: Date, mode: RoundingMode) {
  if (mode === "none") return date;

  const value = new Date(date);
  const minutes = value.getMinutes();
  const remainder = minutes % 5;
  let delta = 0;

  if (mode === "up5" && remainder > 0) delta = 5 - remainder;
  if (mode === "down5") delta = -remainder;
  if (mode === "nearest5") delta = remainder >= 3 ? 5 - remainder : -remainder;

  value.setMinutes(minutes + delta, 0, 0);
  return value;
}

export function getZmanByKey(zmanim: DailyZmanim, key: RelativeZmanKey | null) {
  if (!key) return null;

  const map: Record<RelativeZmanKey, Date | null> = {
    sunrise: zmanim.sunrise,
    sea_level_sunrise: zmanim.seaLevelSunrise,
    sof_zman_shema_gra: zmanim.sofZmanShemaGra,
    sof_zman_tfila_gra: zmanim.sofZmanTfilaGra,
    mincha_gedola: zmanim.minchaGedola,
    mincha_ketana: zmanim.minchaKetana,
    sunset: zmanim.sunset,
    sea_level_sunset: zmanim.seaLevelSunset,
    tzet: zmanim.tzet,
    tzet_72: zmanim.tzet72,
    candle_lighting: zmanim.candleLighting,
    plag_hamincha: zmanim.plagHamincha,
    chatzot: zmanim.chatzot,
  };

  return map[key];
}
