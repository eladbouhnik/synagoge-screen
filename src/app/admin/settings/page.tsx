"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Building2, CalendarClock, Flame, MapPin, ShieldAlert } from "lucide-react";
import { Checkbox, Field, Select, TextInput } from "@/components/ui/field";
import { demoSettings, demoSynagogue } from "@/lib/demo-data";
import { findCityByCoordinates, ISRAEL_CITIES, ISRAEL_TIMEZONE, type IsraelRegion } from "@/lib/locations/israel-cities";
import { getDailyZmanim } from "@/lib/zmanim/engine";
import { formatTime } from "@/lib/utils";
import type { BoardSettings, HeaderDateVariant, Nusach, Synagogue } from "@/types/domain";

const SYNAGOGUE_KEY = "admin:settings";
const BOARD_SETTINGS_KEY = "admin:board-settings";
const CUSTOM_LOCATION = "__custom__";

const nusachOptions: { value: Nusach; label: string }[] = [
  { value: "ספרדי", label: "ספרדי" },
  { value: "אשכנזי", label: "אשכנזי" },
  { value: "תימני", label: "תימני" },
  { value: "חב\"ד", label: "חב\"ד" },
];

const regionOrder: IsraelRegion[] = ["צפון", "מרכז", "ירושלים והסביבה", "דרום"];

const candlePresets = [18, 20, 40];

const headerDateOptions: { value: HeaderDateVariant; label: string }[] = [
  { value: "weekday", label: "יום בשבוע" },
  { value: "gregorian", label: "תאריך לועזי" },
  { value: "hebrew", label: "תאריך עברי" },
  { value: "parsha", label: "פרשת השבוע" },
];

function readSynagogue(): Synagogue {
  if (typeof window === "undefined") return demoSynagogue;
  const stored = window.localStorage.getItem(SYNAGOGUE_KEY);
  return stored ? { ...demoSynagogue, ...(JSON.parse(stored) as Partial<Synagogue>) } : demoSynagogue;
}

function readBoardSettings(): BoardSettings {
  if (typeof window === "undefined") return demoSettings;
  const stored = window.localStorage.getItem(BOARD_SETTINGS_KEY);
  return stored ? { ...demoSettings, ...(JSON.parse(stored) as Partial<BoardSettings>) } : demoSettings;
}

function broadcastDemoChange() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && "BroadcastChannel" in window) {
    const channel = new BroadcastChannel("board:demo-board");
    channel.postMessage({ resource: "settings" });
    channel.close();
  }
}

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  hue: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}

function Section({ icon: Icon, hue, title, subtitle, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `oklch(0.95 0.06 ${hue})`, color: `oklch(0.46 0.15 ${hue})` }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-black">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [synagogue, setSynagogue] = useState<Synagogue>(demoSynagogue);
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(demoSettings);
  const [cityId, setCityId] = useState<string>(CUSTOM_LOCATION);
  const [customLocation, setCustomLocation] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertOverride, setAlertOverride] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    function applyInitialState(s: Synagogue, bs: BoardSettings) {
      const match = findCityByCoordinates(s.latitude, s.longitude);
      setSynagogue(s);
      setBoardSettings(bs);
      setCityId(match?.id ?? CUSTOM_LOCATION);
      setCustomLocation(!match);
      setAlertsEnabled(Boolean(bs.alert_city));
      setAlertOverride(Boolean(bs.alert_city) && bs.alert_city !== (match?.label ?? null));
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      applyInitialState(readSynagogue(), readBoardSettings());
      return;
    }

    void Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()) as Promise<{ rows?: Partial<Synagogue>[] }>,
      fetch("/api/admin/board-settings").then((r) => r.json()) as Promise<{ rows?: Partial<BoardSettings>[] }>,
    ]).then(([settingsBody, boardBody]) => {
      // Merge over the demo defaults so a row from before a column was added
      // (e.g. header_date_display, pre-migration) doesn't crash the form.
      applyInitialState(
        { ...demoSynagogue, ...settingsBody.rows?.[0] },
        { ...demoSettings, ...boardBody.rows?.[0] },
      );
    });
  }, []);

  const selectedCity = useMemo(() => ISRAEL_CITIES.find((city) => city.id === cityId) ?? null, [cityId]);

  const preview = useMemo(() => {
    if (!synagogue.latitude || !synagogue.longitude) return null;
    const zmanim = getDailyZmanim({
      latitude: synagogue.latitude,
      longitude: synagogue.longitude,
      elevation: synagogue.elevation,
      timezone: ISRAEL_TIMEZONE,
      date: new Date(),
      candleLightingMinutes: synagogue.candle_lighting_minutes,
    });
    if (!zmanim.sunset) return null;
    return { sunset: zmanim.sunset, candleLighting: zmanim.candleLighting };
  }, [synagogue.latitude, synagogue.longitude, synagogue.elevation, synagogue.candle_lighting_minutes]);

  function handleCityChange(value: string) {
    if (value === CUSTOM_LOCATION) {
      setCityId(CUSTOM_LOCATION);
      setCustomLocation(true);
      return;
    }
    const city = ISRAEL_CITIES.find((item) => item.id === value);
    if (!city) return;
    setCityId(value);
    setCustomLocation(false);
    setSynagogue((current) => ({
      ...current,
      latitude: city.latitude,
      longitude: city.longitude,
      elevation: city.elevation,
      timezone: ISRAEL_TIMEZONE,
      address: current.address.trim() ? current.address : city.label,
    }));
    if (alertsEnabled && !alertOverride) {
      setBoardSettings((current) => ({ ...current, alert_city: city.label }));
    }
  }

  function toggleAlertsEnabled(checked: boolean) {
    setAlertsEnabled(checked);
    setBoardSettings((current) => ({
      ...current,
      alert_city: checked ? (alertOverride ? current.alert_city : selectedCity?.label ?? null) : null,
    }));
  }

  function toggleAlertOverride(checked: boolean) {
    setAlertOverride(checked);
    if (!checked) {
      setBoardSettings((current) => ({ ...current, alert_city: selectedCity?.label ?? null }));
    }
  }

  function toggleHeaderDateVariant(variant: HeaderDateVariant, checked: boolean) {
    setBoardSettings((current) => ({
      ...current,
      header_date_display: checked
        ? [...current.header_date_display, variant]
        : current.header_date_display.filter((item) => item !== variant),
    }));
  }

  const save = useCallback(async () => {
    setStatus("saving");
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        window.localStorage.setItem(SYNAGOGUE_KEY, JSON.stringify(synagogue));
        window.localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(boardSettings));
        broadcastDemoChange();
        setStatus("saved");
        return;
      }
      const [settingsRes, boardRes] = await Promise.all([
        fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(synagogue) }),
        fetch("/api/admin/board-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(boardSettings) }),
      ]);
      if (!settingsRes.ok || !boardRes.ok) throw new Error("שמירה נכשלה");
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2500);
    }
  }, [synagogue, boardSettings]);

  return (
    <section className="grid gap-6 pb-24">
      <div>
        <p className="text-sm text-muted-foreground">מיקום, נוסח, זמני שבת והתראות פיקוד העורף</p>
        <h2 className="mt-1 text-4xl font-black">הגדרות כלליות</h2>
      </div>

      <Section icon={Building2} hue={86} title="בית הכנסת" subtitle="השם והנוסח כפי שמופיעים על הלוח">
        <Field label="שם בית הכנסת">
          <TextInput value={synagogue.name} onChange={(e) => setSynagogue((c) => ({ ...c, name: e.target.value }))} />
        </Field>
        <Field label="נוסח">
          <Select value={synagogue.nusach} onChange={(e) => setSynagogue((c) => ({ ...c, nusach: e.target.value as Nusach }))}>
            {nusachOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section icon={MapPin} hue={250} title="מיקום" subtitle="קובע את זמני הזריחה, השקיעה וההדלקת נרות">
        <Field label="עיר" className="sm:col-span-2" hint="בחרו את היישוב הקרוב ביותר — קו הרוחב, קו האורך והגובה נקבעים אוטומטית">
          <Select value={cityId} onChange={(e) => handleCityChange(e.target.value)}>
            <option value={CUSTOM_LOCATION}>מיקום מותאם אישית / יישוב שאינו ברשימה</option>
            {regionOrder.map((region) => (
              <optgroup key={region} label={region}>
                {ISRAEL_CITIES.filter((city) => city.region === region).map((city) => (
                  <option key={city.id} value={city.id}>{city.label}</option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <Field label="כתובת לתצוגה על הלוח" className="sm:col-span-2" hint="הטקסט שמופיע מתחת לשם בית הכנסת בראש הלוח">
          <TextInput value={synagogue.address} onChange={(e) => setSynagogue((c) => ({ ...c, address: e.target.value }))} />
        </Field>

        {customLocation ? (
          <>
            <Field label="קו רוחב">
              <TextInput type="number" value={synagogue.latitude} onChange={(e) => setSynagogue((c) => ({ ...c, latitude: Number(e.target.value) }))} />
            </Field>
            <Field label="קו אורך">
              <TextInput type="number" value={synagogue.longitude} onChange={(e) => setSynagogue((c) => ({ ...c, longitude: Number(e.target.value) }))} />
            </Field>
            <Field label="גובה מעל פני הים (מטרים)">
              <TextInput type="number" value={synagogue.elevation} onChange={(e) => setSynagogue((c) => ({ ...c, elevation: Number(e.target.value) }))} />
            </Field>
          </>
        ) : null}

        {preview ? (
          <p className="sm:col-span-2 rounded-md bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            תצוגה מקדימה להיום: שקיעה בשעה <strong className="text-foreground">{formatTime(preview.sunset, ISRAEL_TIMEZONE)}</strong>
            {preview.candleLighting ? <> · הדלקת נרות בשעה <strong className="text-foreground">{formatTime(preview.candleLighting, ISRAEL_TIMEZONE)}</strong></> : null}
          </p>
        ) : null}
      </Section>

      <Section icon={Flame} hue={55} title="הדלקת נרות" subtitle="כמה דקות לפני השקיעה מדליקים נרות שבת וחג">
        <div className="sm:col-span-2 grid gap-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            &ldquo;זמן להדלקת נרות&rdquo; הוא מספר הדקות לפני השקיעה שבהן יש להדליק נרות שבת — זו הפעולה שמכניסה את השבת, ולכן היא חייבת לקרות <strong>לפני</strong> השקיעה, לא אחריה. המנהג הרווח הוא 18 דקות; קהילות רבות בירושלים, בצפת ובמקומות נוספים מקדימות ל-40 דקות.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {candlePresets.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setSynagogue((c) => ({ ...c, candle_lighting_minutes: minutes }))}
                aria-pressed={synagogue.candle_lighting_minutes === minutes}
                className={`rounded-md border px-3 py-1.5 text-sm font-bold transition-colors ${synagogue.candle_lighting_minutes === minutes ? "border-[var(--board-gold)] bg-[oklch(0.95_0.035_88)]" : "border-border text-muted-foreground hover:border-[var(--board-gold-muted)]"}`}
              >
                {minutes} דקות
              </button>
            ))}
            <TextInput
              type="number"
              value={synagogue.candle_lighting_minutes}
              onChange={(e) => setSynagogue((c) => ({ ...c, candle_lighting_minutes: Number(e.target.value) }))}
              className="w-28"
            />
          </div>
        </div>
      </Section>

      <Section icon={CalendarClock} hue={165} title="תצוגת הלוח" subtitle="מה מוצג בכותרת העליונה של הלוח, לצד שם בית הכנסת">
        <span className="sm:col-span-2 flex flex-wrap gap-2">
          {headerDateOptions.map((option) => {
            const checked = boardSettings.header_date_display.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold transition-colors ${checked ? "border-[var(--board-gold)] bg-[oklch(0.95_0.035_88)]" : "border-border text-muted-foreground"}`}
              >
                <Checkbox checked={checked} onChange={(e) => toggleHeaderDateVariant(option.value, e.target.checked)} />
                {option.label}
              </label>
            );
          })}
        </span>
      </Section>

      <Section icon={ShieldAlert} hue={25} title="התראות פיקוד העורף" subtitle="המסך עובר אוטומטית לתצוגת אזעקה כשיש התרעה באזור שלכם">
        <label className="sm:col-span-2 flex cursor-pointer items-center gap-2 text-sm font-bold">
          <Checkbox checked={alertsEnabled} onChange={(e) => toggleAlertsEnabled(e.target.checked)} />
          הפעלת התראות פיקוד העורף עבור המיקום שנבחר למעלה
        </label>

        {alertsEnabled ? (
          <>
            <p className="sm:col-span-2 text-sm leading-relaxed text-muted-foreground">
              כשמתרחשת אזעקה באזורכם, הלוח משתלט אוטומטית: רקע אדום פועם, הוראות מקלט ושמות האזורים — מפיקוד העורף, בזמן אמת. הלוח שואל את שרת פיקוד העורף כל 5 שניות; כשהאזעקה מסתיימת הוא חוזר לתצוגה הרגילה לבד.
            </p>

            {!customLocation ? (
              <label className="sm:col-span-2 flex cursor-pointer items-center gap-2 text-sm font-bold">
                <Checkbox checked={alertOverride} onChange={(e) => toggleAlertOverride(e.target.checked)} />
                השם באתר פיקוד העורף שונה מ&ldquo;{selectedCity?.label}&rdquo; (נפוץ בערים גדולות כמו תל אביב, ירושלים וחיפה שמחולקות למספר אזורי התרעה)
              </label>
            ) : null}

            {customLocation || alertOverride ? (
              <Field label="שם העיר/אזור בעברית" className="sm:col-span-2" hint="הזינו בדיוק כפי שמופיע ב-oref.org.il">
                <TextInput
                  dir="rtl"
                  placeholder="לדוגמה: צפת"
                  value={boardSettings.alert_city ?? ""}
                  onChange={(e) => setBoardSettings((c) => ({ ...c, alert_city: e.target.value || null }))}
                />
              </Field>
            ) : (
              <p className="sm:col-span-2 text-sm text-muted-foreground">
                עיר להתראות: <strong className="text-foreground">{selectedCity?.label}</strong>
              </p>
            )}

            <p className="sm:col-span-2 text-xs text-muted-foreground">
              מקור: <a href="https://www.oref.org.il" target="_blank" rel="noopener noreferrer" className="underline">אתר פיקוד העורף</a>
            </p>
          </>
        ) : null}
      </Section>

      <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
        <button
          onClick={() => void save()}
          disabled={status === "saving"}
          className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "saving" ? "שומר..." : "שמירה"}
        </button>
        {status === "saved" && <span className="text-sm font-bold text-green-600">נשמר ✓</span>}
        {status === "error" && <span className="text-sm font-bold text-red-600">שגיאה בשמירה</span>}
      </div>
    </section>
  );
}
