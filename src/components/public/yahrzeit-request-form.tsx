"use client";

import { useMemo, useState } from "react";
import { Flame, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import {
  formatHebrewDate,
  getDaysInHebrewMonth,
  getHebrewMonthsForYear,
  getJewishDateParts,
} from "@/lib/zmanim/hebrewCalendar";

interface YahrzeitRequestFormProps {
  boardKey: string;
  synagogueName: string;
}

export function YahrzeitRequestForm({ boardKey, synagogueName }: YahrzeitRequestFormProps) {
  const today = useMemo(() => getJewishDateParts(new Date()), []);
  const [deceasedName, setDeceasedName] = useState("");
  const [gender, setGender] = useState<"זכר" | "נקבה">("זכר");
  const [parentName, setParentName] = useState("");
  const [donorName, setDonorName] = useState("");
  const [contact, setContact] = useState("");
  const [hebrewYear, setHebrewYear] = useState(today.year);
  const [hebrewMonth, setHebrewMonth] = useState(today.month);
  const [hebrewDay, setHebrewDay] = useState(today.day);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const hebrewMonths = useMemo(() => getHebrewMonthsForYear(hebrewYear), [hebrewYear]);
  const daysInMonth = useMemo(() => getDaysInHebrewMonth(hebrewYear, hebrewMonth), [hebrewYear, hebrewMonth]);

  function applyGregorianDate(value: string) {
    if (!value) return;
    const [year, month, day] = value.split("-").map(Number);
    const parts = getJewishDateParts(new Date(year, month - 1, day, 12));
    setHebrewYear(parts.year);
    setHebrewMonth(parts.month);
    setHebrewDay(Math.min(parts.day, getDaysInHebrewMonth(parts.year, parts.month)));
  }

  async function submit() {
    setError(null);
    if (!deceasedName.trim() || !parentName.trim()) {
      setError("נא למלא את שם הנפטר/ת ושם ההורה");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/public/yahrzeit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardKey,
          deceased_name: deceasedName.trim(),
          gender,
          parent_name: parentName.trim(),
          hebrew_death_date: formatHebrewDate(hebrewYear, hebrewMonth, hebrewDay),
          donor_name: donorName.trim() || null,
          submitter_contact: contact.trim() || null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "שליחת הבקשה נכשלה, נסו שוב");
        return;
      }

      setDone(true);
    } catch {
      setError("שליחת הבקשה נכשלה, בדקו את החיבור ונסו שוב");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 text-center shadow-[0_20px_40px_-24px_oklch(0.25_0.04_255/0.35)]">
        <Flame className="mx-auto h-8 w-8 text-[var(--board-gold)]" />
        <h1 className="mt-4 text-2xl font-black">הבקשה נשלחה</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          הבקשה הועברה למזכירות {synagogueName} לאישור. לאחר האישור היא תופיע בלוח בית הכנסת.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-[0_20px_40px_-24px_oklch(0.25_0.04_255/0.35)]">
      <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
      <h1 className="mt-4 text-2xl font-black">בקשת עילוי נשמת</h1>
      <p className="mt-1 text-sm text-muted-foreground">{synagogueName} · הבקשה תוצג בלוח לאחר אישור המזכירות</p>

      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Field label="שם הנפטר/ת">
          <TextInput value={deceasedName} onChange={(event) => setDeceasedName(event.target.value)} required />
        </Field>

        <Field label="מין">
          <Select value={gender} onChange={(event) => setGender(event.target.value as "זכר" | "נקבה")}>
            <option value="זכר">זכר</option>
            <option value="נקבה">נקבה</option>
          </Select>
        </Field>

        <Field label="שם ההורה" hint="לצורך זיהוי, למשל: אברהם או שרה">
          <TextInput value={parentName} onChange={(event) => setParentName(event.target.value)} required />
        </Field>

        <Field label="תאריך פטירה לועזי" hint="בחרו כדי למלא אוטומטית את התאריך העברי, ותקנו במידת הצורך">
          <input
            type="date"
            onChange={(event) => applyGregorianDate(event.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none transition-colors focus:border-[var(--board-gold)]"
          />
        </Field>

        <Field label="תאריך פטירה עברי">
          <div className="grid grid-cols-3 gap-2">
            <Select value={hebrewDay} onChange={(event) => setHebrewDay(Number(event.target.value))}>
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </Select>
            <Select value={hebrewMonth} onChange={(event) => setHebrewMonth(Number(event.target.value))}>
              {hebrewMonths.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </Select>
            <Select value={hebrewYear} onChange={(event) => setHebrewYear(Number(event.target.value))}>
              {Array.from({ length: 11 }, (_, index) => today.year - 8 + index).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>
          <span className="text-xs font-normal text-muted-foreground">{formatHebrewDate(hebrewYear, hebrewMonth, hebrewDay)}</span>
        </Field>

        <Field label="שם התורם/משפחה להצגה בלוח (אופציונלי)">
          <TextInput value={donorName} onChange={(event) => setDonorName(event.target.value)} />
        </Field>

        <Field label="טלפון או אימייל ליצירת קשר (אופציונלי)" hint="לשימוש המזכירות בלבד, לא יוצג בלוח">
          <TextInput value={contact} onChange={(event) => setContact(event.target.value)} />
        </Field>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting}>
          <Send className="h-5 w-5" />
          {submitting ? "שולחים..." : "שליחת הבקשה"}
        </Button>
      </form>
    </div>
  );
}
