import { getZmanimJson } from "kosher-zmanim";
import type { DawnOpinion, NightfallOpinion, RelativeDay, RelativeZmanKey, RoundingMode, ShemaTefilaOpinion, Synagogue, ZmanimOpinions } from "@/types/domain";
import { addMinutes } from "@/lib/utils";

export const DEFAULT_ZMANIM_OPINIONS: ZmanimOpinions = {
  dawn: "72",
  shema_tefila: "gra",
  nightfall: "geonim",
};

export interface ZmanimPreset {
  id: string;
  label: string;
  description: string;
  opinions: ZmanimOpinions;
}

// Sensible starting points, not binding psak — a shul's rabbi should confirm/override these.
export const ZMANIM_PRESETS: ZmanimPreset[] = [
  {
    id: "sephardi",
    label: "ספרדי",
    description: "עלות 72 דקות, גר\"א לזמני שמע/תפילה, צאת הכוכבים לפי שיטת הגאונים.",
    opinions: { dawn: "72", shema_tefila: "gra", nightfall: "geonim" },
  },
  {
    id: "ashkenazi",
    label: "אשכנזי (מחמיר)",
    description: "עלות 90 דקות, מג\"א לזמני שמע/תפילה, רבנו תם לצאת הכוכבים.",
    opinions: { dawn: "90", shema_tefila: "mga", nightfall: "rabbeinu_tam" },
  },
  {
    id: "chabad",
    label: "חב\"ד",
    description: "כל הזמנים לפי שיטת בעל התניא.",
    opinions: { dawn: "baal_hatanya", shema_tefila: "baal_hatanya", nightfall: "baal_hatanya" },
  },
];

export interface ZmanimInput {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  locationName?: string;
  date: Date;
  candleLightingMinutes: number;
  opinions?: ZmanimOpinions;
}

export interface DailyZmanim {
  date: string;
  timezone: string;
  alos: Date | null;
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
  tzet72Zmanis: Date | null;
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

function pickDawn(zmanim: ZmanimJson["Zmanim"], opinion: DawnOpinion) {
  const byOpinion: Record<DawnOpinion, string | null | undefined> = {
    "72": zmanim.Alos72,
    "90": zmanim.Alos90,
    "96": zmanim.Alos96,
    baal_hatanya: zmanim.AlosBaalHatanya,
  };
  return toDate(byOpinion[opinion]);
}

function pickShemaTefila(zmanim: ZmanimJson["Zmanim"], opinion: ShemaTefilaOpinion) {
  const byOpinion: Record<ShemaTefilaOpinion, { shema?: string | null; tfila?: string | null; minchaGedola?: string | null; minchaKetana?: string | null; plagHamincha?: string | null }> = {
    gra: { shema: zmanim.SofZmanShmaGRA, tfila: zmanim.SofZmanTfilaGRA },
    mga: { shema: zmanim.SofZmanShmaMGA, tfila: zmanim.SofZmanTfilaMGA },
    baal_hatanya: {
      shema: zmanim.SofZmanShmaBaalHatanya,
      tfila: zmanim.SofZmanTfilaBaalHatanya,
      minchaGedola: zmanim.MinchaGedolaBaalHatanya,
      minchaKetana: zmanim.MinchaKetanaBaalHatanya,
      plagHamincha: zmanim.PlagHaminchaBaalHatanya,
    },
  };
  return byOpinion[opinion];
}

function pickNightfall(zmanim: ZmanimJson["Zmanim"], opinion: NightfallOpinion) {
  const byOpinion: Record<NightfallOpinion, string | null | undefined> = {
    geonim: zmanim.TzaisGeonim7Point083Degrees ?? zmanim.Tzais,
    rabbeinu_tam: zmanim.Tzais72Zmanis,
    baal_hatanya: zmanim.TzaisBaalHatanya,
  };
  return toDate(byOpinion[opinion]);
}

export function getDailyZmanim(input: ZmanimInput): DailyZmanim {
  const opinions = input.opinions ?? DEFAULT_ZMANIM_OPINIONS;
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
  const shemaTefila = pickShemaTefila(json.Zmanim, opinions.shema_tefila);

  return {
    date: input.date.toISOString().slice(0, 10),
    timezone: input.timezone,
    alos: pickDawn(json.Zmanim, opinions.dawn),
    sunrise: toDate(json.Zmanim.Sunrise),
    seaLevelSunrise: toDate(json.Zmanim.SeaLevelSunrise),
    sofZmanShemaGra: toDate(shemaTefila.shema),
    sofZmanTfilaGra: toDate(shemaTefila.tfila),
    chatzot: toDate(json.Zmanim.Chatzos),
    minchaGedola: toDate(shemaTefila.minchaGedola ?? json.Zmanim.MinchaGedola),
    minchaKetana: toDate(shemaTefila.minchaKetana ?? json.Zmanim.MinchaKetana),
    plagHamincha: toDate(shemaTefila.plagHamincha ?? json.Zmanim.PlagHamincha),
    sunset,
    seaLevelSunset: toDate(json.Zmanim.SeaLevelSunset),
    tzet: pickNightfall(json.Zmanim, opinions.nightfall),
    tzet72: toDate(json.Zmanim.Tzais72),
    tzet72Zmanis: toDate(json.Zmanim.Tzais72Zmanis),
    candleLighting: sunset ? addMinutes(sunset, -input.candleLightingMinutes) : null,
  };
}

export function getDailyZmanimForSynagogue(synagogue: Synagogue, date = new Date(), opinions?: ZmanimOpinions) {
  return getDailyZmanim({
    latitude: synagogue.latitude,
    longitude: synagogue.longitude,
    elevation: synagogue.elevation,
    timezone: synagogue.timezone,
    locationName: synagogue.name,
    date,
    candleLightingMinutes: synagogue.candle_lighting_minutes,
    opinions,
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
    alos: zmanim.alos,
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
    tzet_shabbat: zmanim.tzet,
    // Rabbeinu Tam's shitah is defined via proportional (zmanis) minutes, not a flat 72 — use the real variant.
    tzet_shabbat_rt: zmanim.tzet72Zmanis,
    candle_lighting: zmanim.candleLighting,
    plag_hamincha: zmanim.plagHamincha,
    chatzot: zmanim.chatzot,
  };

  return map[key];
}
