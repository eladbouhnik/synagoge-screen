export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Nusach = "ספרדי" | "אשכנזי" | "תימני" | "חב\"ד";
export type DateSwitchBasis = "24h" | "sunset";
export type RoundingMode = "none" | "up5" | "down5" | "nearest5";
export type DayType = "weekday" | "shabbat" | "holiday";
export type TimeMode = "fixed" | "relative";
export type RelativeZmanKey =
  | "sunrise"
  | "sunset"
  | "tzet"
  | "candle_lighting"
  | "plag_hamincha"
  | "chatzot";
export type RelativeDay = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "shabbat";

export type ScreenType =
  | "tfilot"
  | "messages"
  | "iluy_neshama"
  | "shiurim"
  | "halachot"
  | "parnasim"
  | "birthdays"
  | "clock"
  | "zmanei_hayom";

export interface Synagogue {
  id: string;
  board_key: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  nusach: Nusach;
  candle_lighting_minutes: number;
  logo_url: string | null;
  donor_dedication: string | null;
  created_at: string;
}

export interface BoardSettings {
  synagogue_id: string;
  show_national_holidays: boolean;
  date_switch_basis: DateSwitchBasis;
  zman_rounding: RoundingMode;
  time_format: "24h";
  default_screen_duration: number;
}

export interface Screen {
  id: string;
  synagogue_id: string;
  type: ScreenType;
  title: string;
  duration_seconds: number;
  is_visible: boolean;
  sort_order: number;
  config: Record<string, Json>;
}

export interface Message {
  id: string;
  synagogue_id: string;
  title: string;
  body: string;
  background_url: string | null;
  style: Record<string, Json>;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export interface PrayerTime {
  id: string;
  synagogue_id: string;
  day_type: DayType;
  prayer: "shacharit" | "mincha" | "arvit" | "musaf" | "selichot" | "other";
  label: string;
  time_mode: TimeMode;
  fixed_time: string | null;
  relative_to: RelativeZmanKey | null;
  offset_minutes: number;
  relative_day: RelativeDay | null;
  rounding: RoundingMode | null;
  minyan_number: number;
}

export interface IluyNeshama {
  id: string;
  synagogue_id: string;
  deceased_name: string;
  gender: "זכר" | "נקבה";
  parent_name: string;
  hebrew_death_date: string;
  donor_name: string | null;
}

export interface Shiur {
  id: string;
  synagogue_id: string;
  day_type: DayType;
  title: string;
  rabbi_name: string;
  days: RelativeDay[];
  time_mode: TimeMode;
  fixed_time: string | null;
  relative_to: RelativeZmanKey | null;
  offset_minutes: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface Halacha {
  id: string;
  synagogue_id: string;
  category: string;
  body: string;
  is_selected: boolean;
  holiday_tag: string | null;
}

export interface Parnas {
  id: string;
  synagogue_id: string;
  parnas_name: string;
  blessing: string;
  start_date: string;
  end_date: string;
  period: "יום" | "חודש" | "שנה";
  phone: string | null;
}

export interface Congregant {
  id: string;
  synagogue_id: string;
  full_name: string;
  hebrew_birth_date: string | null;
  gregorian_birth_date: string | null;
  phone: string | null;
}

export interface AdminUser {
  id: string;
  user_id: string;
  synagogue_id: string;
  role: "owner" | "editor" | "viewer";
}

export interface BoardPayload {
  synagogue: Synagogue;
  settings: BoardSettings;
  screens: Screen[];
  messages: Message[];
  prayerTimes: PrayerTime[];
  iluyNeshama: IluyNeshama[];
  shiurim: Shiur[];
  halachot: Halacha[];
  parnasim: Parnas[];
  congregants: Congregant[];
  generatedAt: string;
}
