import type {
  BoardPayload,
  BoardSettings,
  Congregant,
  Halacha,
  IluyNeshama,
  Message,
  Parnas,
  PrayerTime,
  Screen,
  Shiur,
  Synagogue,
} from "@/types/domain";

const synagogueId = "11111111-1111-4111-8111-111111111111";

export const demoSynagogue: Synagogue = {
  id: synagogueId,
  board_key: "demo-board",
  name: "בית הכנסת אור הגליל",
  address: "צפת, הגליל העליון",
  latitude: 32.9646,
  longitude: 35.496,
  elevation: 900,
  timezone: "Asia/Jerusalem",
  nusach: "ספרדי",
  candle_lighting_minutes: 40,
  logo_url: null,
  donor_dedication: "הלוח נתרם לעילוי נשמת מייסדי הקהילה",
  created_at: "2026-01-01T00:00:00.000Z",
};

export const demoSettings: BoardSettings = {
  synagogue_id: synagogueId,
  show_national_holidays: true,
  date_switch_basis: "sunset",
  zman_rounding: "nearest5",
  time_format: "24h",
  default_screen_duration: 14,
};

export const demoScreens: Screen[] = [
  { id: "screen-tfilot", synagogue_id: synagogueId, type: "tfilot", title: "זמני תפילות", duration_seconds: 16, is_visible: true, sort_order: 10, config: {} },
  { id: "screen-zmanim", synagogue_id: synagogueId, type: "zmanei_hayom", title: "זמני היום", duration_seconds: 14, is_visible: true, sort_order: 20, config: {} },
  { id: "screen-messages", synagogue_id: synagogueId, type: "messages", title: "מודעות הקהילה", duration_seconds: 12, is_visible: true, sort_order: 30, config: {} },
  { id: "screen-shiurim", synagogue_id: synagogueId, type: "shiurim", title: "שיעורי תורה", duration_seconds: 12, is_visible: true, sort_order: 40, config: {} },
  { id: "screen-iluy", synagogue_id: synagogueId, type: "iluy_neshama", title: "לעילוי נשמת", duration_seconds: 12, is_visible: true, sort_order: 50, config: { layout: "center" } },
  { id: "screen-halacha", synagogue_id: synagogueId, type: "halachot", title: "הלכה יומית", duration_seconds: 12, is_visible: true, sort_order: 60, config: {} },
  { id: "screen-parnasim", synagogue_id: synagogueId, type: "parnasim", title: "פרנסי החודש", duration_seconds: 10, is_visible: true, sort_order: 70, config: {} },
  { id: "screen-birthdays", synagogue_id: synagogueId, type: "birthdays", title: "ימי הולדת", duration_seconds: 10, is_visible: true, sort_order: 80, config: {} },
  { id: "screen-clock", synagogue_id: synagogueId, type: "clock", title: "שעון", duration_seconds: 8, is_visible: true, sort_order: 90, config: {} },
];

export const demoMessages: Message[] = [
  {
    id: "message-1",
    synagogue_id: synagogueId,
    title: "שבת קהילה",
    body: "קידוש קהילתי לאחר תפילת מוסף. הציבור מוזמן להשתתף ולכבד.",
    background_url: null,
    style: { tone: "warm" },
    start_date: "2026-01-01",
    end_date: null,
    is_active: true,
  },
  {
    id: "message-2",
    synagogue_id: synagogueId,
    title: "הודעה לגבאים",
    body: "נא לעדכן זמני תפילות מיוחדים דרך הפאנל עד יום חמישי בשעה 18:00.",
    background_url: null,
    style: { tone: "quiet" },
    start_date: "2026-01-01",
    end_date: null,
    is_active: true,
  },
];

export const demoPrayerTimes: PrayerTime[] = [
  { id: "pt-1", synagogue_id: synagogueId, day_type: "weekday", prayer: "shacharit", label: "שחרית ותיקין", time_mode: "relative", fixed_time: null, relative_to: "sunrise", offset_minutes: -8, relative_day: null, rounding: "nearest5", minyan_number: 1, days: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"], is_active: true },
  { id: "pt-2", synagogue_id: synagogueId, day_type: "weekday", prayer: "shacharit", label: "שחרית", time_mode: "fixed", fixed_time: "07:15", relative_to: null, offset_minutes: 0, relative_day: null, rounding: "none", minyan_number: 2, days: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"], is_active: true },
  { id: "pt-3", synagogue_id: synagogueId, day_type: "weekday", prayer: "mincha", label: "מנחה", time_mode: "relative", fixed_time: null, relative_to: "sunset", offset_minutes: -20, relative_day: null, rounding: "nearest5", minyan_number: 1, days: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"], is_active: true },
  { id: "pt-4", synagogue_id: synagogueId, day_type: "weekday", prayer: "arvit", label: "ערבית", time_mode: "relative", fixed_time: null, relative_to: "tzet", offset_minutes: 5, relative_day: null, rounding: "nearest5", minyan_number: 1, days: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"], is_active: true },
  { id: "pt-5", synagogue_id: synagogueId, day_type: "shabbat", prayer: "mincha", label: "מנחה ערב שבת", time_mode: "relative", fixed_time: null, relative_to: "candle_lighting", offset_minutes: -20, relative_day: "friday", rounding: "nearest5", minyan_number: 1, days: ["friday"], is_active: true },
];

export const demoIluyNeshama: IluyNeshama[] = [
  { id: "in-1", synagogue_id: synagogueId, deceased_name: "רפאל בן מרים", gender: "זכר", parent_name: "מרים", hebrew_death_date: "י״ב תמוז", donor_name: "משפחת כהן" },
  { id: "in-2", synagogue_id: synagogueId, deceased_name: "אסתר בת שרה", gender: "נקבה", parent_name: "שרה", hebrew_death_date: "ט״ו תמוז", donor_name: "משפחת לוי" },
];

export const demoShiurim: Shiur[] = [
  { id: "shiur-1", synagogue_id: synagogueId, day_type: "weekday", title: "דף יומי", rabbi_name: "הרב אליהו מזרחי", days: ["sunday", "monday", "tuesday", "wednesday", "thursday"], time_mode: "fixed", fixed_time: "20:30", relative_to: null, offset_minutes: 0, duration_minutes: 45, is_active: true },
  { id: "shiur-2", synagogue_id: synagogueId, day_type: "shabbat", title: "הלכות שבת", rabbi_name: "הרב דוד אוחנה", days: ["shabbat"], time_mode: "relative", fixed_time: null, relative_to: "plag_hamincha", offset_minutes: 20, duration_minutes: 35, is_active: true },
];

export const demoHalachot: Halacha[] = [
  { id: "halacha-1", synagogue_id: synagogueId, category: "תפילה", body: "טוב לכוון לפני התפילה שהוא עומד לפני מלך מלכי המלכים, ולפנות את מחשבתו מטרדות היום.", is_selected: true, holiday_tag: null },
  { id: "halacha-2", synagogue_id: synagogueId, category: "שבת", body: "נוהגים להכין צרכי שבת מבעוד יום כדי להיכנס לשבת בנחת ובכבוד.", is_selected: true, holiday_tag: null },
];

export const demoParnasim: Parnas[] = [
  { id: "parnas-1", synagogue_id: synagogueId, parnas_name: "משפחת בן דוד", blessing: "לברכה והצלחה בכל מעשי ידיהם", start_date: "2026-01-01", end_date: "2026-12-31", period: "שנה", phone: null },
];

export const demoCongregants: Congregant[] = [
  { id: "cong-1", synagogue_id: synagogueId, full_name: "יוסף כהן", hebrew_birth_date: "י״ח תמוז", gregorian_birth_date: "2026-07-24", phone: null },
  { id: "cong-2", synagogue_id: synagogueId, full_name: "מיכל לוי", hebrew_birth_date: "כ״א תמוז", gregorian_birth_date: "2026-07-27", phone: null },
];

export function createDemoBoardPayload(): BoardPayload {
  return {
    synagogue: demoSynagogue,
    settings: demoSettings,
    screens: demoScreens,
    messages: demoMessages,
    prayerTimes: demoPrayerTimes,
    iluyNeshama: demoIluyNeshama,
    shiurim: demoShiurim,
    halachot: demoHalachot,
    parnasim: demoParnasim,
    congregants: demoCongregants,
    generatedAt: new Date().toISOString(),
  };
}
