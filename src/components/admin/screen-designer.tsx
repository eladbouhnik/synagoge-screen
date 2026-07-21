"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import {
  getScreenDesignConfig,
  screenBackgroundLabels,
  screenBackgrounds,
  screenContentBlocks,
  screenLayouts,
  specialDays,
  type ScreenBackground,
  type ScreenContentBlock,
  type ScreenLayout,
  type SpecialDay,
} from "@/lib/board/screen-config";
import type { BoardPayload, Screen, ScreenType } from "@/types/domain";
import { ScreenPreview } from "@/components/board/screen-preview";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";

interface ScreenDesignerProps {
  initialRows: Screen[];
  payload: BoardPayload;
}

const contentLabels: Record<ScreenContentBlock, string> = {
  tfilot: "זמני תפילות",
  zmanei_hayom: "זמני היום",
  messages: "הודעות",
  shiurim: "שיעורים",
  iluy_neshama: "לעילוי נשמה",
  halachot: "הלכה יומית",
  parnasim: "פרנסים",
  birthdays: "ימי הולדת",
  clock: "שעון ותאריך",
};

const layoutLabels: Record<ScreenLayout, string> = {
  single: "מסך מרכזי",
  spotlight: "מוקד גדול",
  poster: "כרזה ענקית",
  banner: "פס רחב",
  sidebar: "כותרת בצד",
  feature: "מוקד עם אריחים",
  split: "שני חלקים",
  "two-column": "שתי עמודות",
  "three-column": "שלוש עמודות",
  "four-grid": "רשת ארבע",
  ledger: "לוח מסודר",
};

const specialDayLabels: Record<SpecialDay, string> = {
  all: "כל יום",
  weekday: "ימי חול",
  shabbat: "שישי ושבת",
  holiday: "חגים",
};

const layoutDiagrams: Record<ScreenLayout, React.ReactNode> = {
  single: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="28" height="18" rx="1.5" />
    </svg>
  ),
  spotlight: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="28" height="13" rx="1.5" />
      <rect x="2" y="17" width="28" height="3" rx="1" />
    </svg>
  ),
  poster: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="9" y="2" width="14" height="18" rx="1.5" />
    </svg>
  ),
  banner: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="8" width="28" height="6" rx="1.5" />
    </svg>
  ),
  sidebar: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="8" height="18" rx="1.5" />
      <rect x="12" y="2" width="18" height="18" rx="1.5" />
    </svg>
  ),
  feature: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="16" height="18" rx="1.5" />
      <rect x="20" y="2" width="10" height="8" rx="1" />
      <rect x="20" y="12" width="10" height="8" rx="1" />
    </svg>
  ),
  split: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="13" height="18" rx="1.5" />
      <rect x="17" y="2" width="13" height="18" rx="1.5" />
    </svg>
  ),
  "two-column": (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="12" height="18" rx="1.5" />
      <rect x="18" y="2" width="12" height="18" rx="1.5" />
    </svg>
  ),
  "three-column": (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="7.5" height="18" rx="1" />
      <rect x="12.25" y="2" width="7.5" height="18" rx="1" />
      <rect x="22.5" y="2" width="7.5" height="18" rx="1" />
    </svg>
  ),
  "four-grid": (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="2" width="12" height="8" rx="1" />
      <rect x="18" y="2" width="12" height="8" rx="1" />
      <rect x="2" y="12" width="12" height="8" rx="1" />
      <rect x="18" y="12" width="12" height="8" rx="1" />
    </svg>
  ),
  ledger: (
    <svg viewBox="0 0 32 22" fill="currentColor" className="w-full opacity-60">
      <rect x="2" y="3" width="28" height="3" rx="1" />
      <rect x="2" y="8.5" width="28" height="3" rx="1" />
      <rect x="2" y="14" width="28" height="3" rx="1" />
      <rect x="2" y="19.5" width="20" height="2" rx="1" />
    </svg>
  ),
};

function LayoutPicker({ value, onChange }: { value: ScreenLayout; onChange: (v: ScreenLayout) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {screenLayouts.map((layout) => {
        const active = layout === value;
        return (
          <button
            key={layout}
            type="button"
            onClick={() => onChange(layout)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
              active
                ? "border-[var(--board-gold)] bg-[oklch(0.95_0.035_88)] text-foreground"
                : "border-border text-muted-foreground hover:border-[var(--board-gold-muted)] hover:text-foreground"
            }`}
          >
            <div className="w-full">{layoutDiagrams[layout]}</div>
            <span className="text-[10px] font-bold leading-tight text-center">{layoutLabels[layout]}</span>
          </button>
        );
      })}
    </div>
  );
}

const colorFamilies = ["", "ruby-", "emerald-", "ivory-", "teal-"] as const;
const motifs = ["parochet", "arches", "stars", "mosaic", "pomegranates"] as const;
const familyLabels: Record<string, string> = {
  "": "כחול",
  "ruby-": "אודם",
  "emerald-": "אזמרגד",
  "ivory-": "שנהב",
  "teal-": "טורקיז",
};

function SwatchGrid({ value, onChange }: { value: ScreenBackground; onChange: (v: ScreenBackground) => void }) {
  return (
    <div className="grid gap-1">
      {colorFamilies.map((family) => (
        <div key={family} className="flex items-center gap-1">
          <span className="w-10 shrink-0 text-[10px] font-bold text-muted-foreground text-left">{familyLabels[family]}</span>
          <div className="flex gap-1 flex-1">
            {motifs.map((motif) => {
              const variant = `${family}${motif}` as ScreenBackground;
              const active = variant === value;
              return (
                <button
                  key={variant}
                  type="button"
                  title={screenBackgroundLabels[variant]}
                  onClick={() => onChange(variant)}
                  className={`board-theme-${variant} flex-1 h-8 rounded-md border bg-cover bg-center transition-transform hover:scale-105 ${
                    active ? "ring-2 ring-[var(--board-gold)] ring-offset-1" : "border-border/40"
                  }`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function makeNewScreen(rows: Screen[], initialRows: Screen[]): Screen {
  const source = rows[0] ?? initialRows[0];
  return {
    id: crypto.randomUUID(),
    synagogue_id: source?.synagogue_id ?? "",
    type: "messages",
    title: "מסך חדש",
    duration_seconds: 12,
    is_visible: true,
    sort_order: Math.max(0, ...rows.map((row) => row.sort_order)) + 10,
    config: {
      background_variant: "parochet",
      layout: "feature",
      content_blocks: ["messages"],
      special_day: "all",
    },
  };
}

export function ScreenDesigner({ initialRows, payload }: ScreenDesignerProps) {
  const [rows, setRows] = useState<Screen[]>(() => {
    if (typeof window === "undefined") return initialRows;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
    const stored = window.localStorage.getItem("admin:screens");
    return stored ? (JSON.parse(stored) as Screen[]) : initialRows;
  });
  const [draft, setDraft] = useState<Screen | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Screen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentDesign = useMemo(() => (draft ? getScreenDesignConfig(draft) : null), [draft]);
  const isNewDraft = draft ? !rows.some((row) => row.id === draft.id) : false;

  // rows is a snapshot taken at mount; another tab (or this one, earlier) may have
  // written newer data since. Re-reading right before a write keeps a stale local
  // copy from clobbering unrelated screens that changed out from under this one.
  const latestRows = useCallback((): Screen[] => {
    if (typeof window === "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL) return rows;
    const stored = window.localStorage.getItem("admin:screens");
    return stored ? (JSON.parse(stored) as Screen[]) : rows;
  }, [rows]);

  const persist = useCallback((nextRows: Screen[]) => {
    setRows(nextRows);
    window.localStorage.setItem("admin:screens", JSON.stringify(nextRows));
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("board:demo-board");
      channel.postMessage({ resource: "screens" });
      channel.close();
    }
  }, []);

  const edit = (screen: Screen) => {
    const design = getScreenDesignConfig(screen);
    setDraft({ ...screen, config: { ...screen.config, ...design } });
    setShowTitle(screen.title !== "");
    setError(null);
  };

  const closeDialog = () => {
    setDraft(null);
    setError(null);
  };

  const update = (next: Partial<Screen>) => setDraft((current) => (current ? { ...current, ...next } : current));

  const updateDesign = (next: Partial<ReturnType<typeof getScreenDesignConfig>>) => {
    setDraft((current) =>
      current ? { ...current, config: { ...current.config, ...getScreenDesignConfig(current), ...next } } : current,
    );
  };

  const toggleContent = (content: ScreenContentBlock) => {
    if (!currentDesign) return;
    const next = currentDesign.content_blocks.includes(content)
      ? currentDesign.content_blocks.filter((item) => item !== content)
      : [...currentDesign.content_blocks, content];
    if (next.length) updateDesign({ content_blocks: next });
  };

  async function save() {
    if (!draft || !currentDesign) return;
    if (showTitle && !draft.title.trim()) {
      setError("יש להזין כותרת.");
      return;
    }
    if (!currentDesign.content_blocks.length) {
      setError("יש לבחור לפחות תוכן אחד.");
      return;
    }
    const derivedType: ScreenType = currentDesign.content_blocks.includes("clock")
      ? "clock"
      : (currentDesign.content_blocks[0] as ScreenType);
    const nextScreen: Screen = {
      ...draft,
      type: derivedType,
      title: showTitle ? draft.title.trim() : "",
      duration_seconds: Math.max(4, Number(draft.duration_seconds) || 12),
      config: { ...draft.config, ...currentDesign },
    };
    setSaving(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const response = await fetch("/api/admin/screens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextScreen),
        });
        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          setError(result.error ?? "שמירת המסך נכשלה.");
          return;
        }
      }
      const latest = latestRows();
      const exists = latest.some((row) => row.id === nextScreen.id);
      persist(exists ? latest.map((row) => (row.id === nextScreen.id ? nextScreen : row)) : [...latest, nextScreen]);
      closeDialog();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const response = await fetch("/api/admin/screens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "מחיקת המסך נכשלה.");
        setPendingDelete(null);
        return;
      }
    }
    persist(latestRows().filter((row) => row.id !== id));
    if (draft?.id === id) setDraft(null);
    setPendingDelete(null);
  }

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let cancelled = false;
    fetch("/api/admin/screens", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ rows?: Screen[] }>)
      .then((result) => {
        if (!cancelled && result.rows) setRows(result.rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="grid gap-6" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">תוכן, תפאורה, פריסה ותנאי תצוגה</p>
          <h2 className="mt-1 text-4xl font-black">עורך מסכים</h2>
        </div>
        <Button onClick={() => edit(makeNewScreen(rows, initialRows))}>
          <Plus className="h-4 w-4" /> מסך חדש
        </Button>
      </div>

      {error && !draft ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full text-right">
          <thead className="border-b border-border text-sm text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-bold">מסך</th>
              <th className="px-4 py-3 font-bold">פריסה</th>
              <th className="px-4 py-3 font-bold">הצגה</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((screen) => {
              const design = getScreenDesignConfig(screen);
              return (
                <tr key={screen.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`board-theme-${design.background_variant} h-9 w-16 shrink-0 rounded-md border border-border bg-cover bg-center`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold">{screen.title || <span className="text-muted-foreground italic">ללא כותרת</span>}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {design.content_blocks.map((item) => contentLabels[item]).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {layoutLabels[design.layout]}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm">
                      {screen.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {screen.duration_seconds} שנ׳
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => edit(screen)}
                        className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-[var(--board-gold)] hover:text-foreground"
                        aria-label="עריכה"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(screen)}
                        className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600"
                        aria-label="מחיקה"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={draft !== null}
        onClose={closeDialog}
        title={isNewDraft ? "מסך חדש" : `עריכת מסך — ${draft?.title || "ללא כותרת"}`}
        subtitle="השינויים מוצגים מיד בתצוגה המקדימה"
        maxWidth="max-w-6xl"
      >
        {draft && currentDesign ? (
          <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {/* Preview — sticky left column */}
            <div className="border-b border-border p-5 lg:border-b-0 lg:border-l">
              <ScreenPreview payload={payload} screen={{ ...draft, title: showTitle ? draft.title : "", config: { ...draft.config, ...currentDesign } }} />
              <p className="mt-2 text-center text-xs text-muted-foreground">כך ייראה המסך על הלוח</p>
            </div>

            {/* Form — right column, independently scrollable */}
            <div className="flex flex-col overflow-y-auto">
              <div className="grid gap-5 p-5">

                {/* Title row */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold">כותרת המסך</label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={!showTitle}
                        onChange={(e) => setShowTitle(!e.target.checked)}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      ללא כותרת
                    </label>
                  </div>
                  {showTitle && (
                    <TextInput
                      value={draft.title}
                      onChange={(e) => update({ title: e.target.value })}
                      placeholder="שם המסך"
                    />
                  )}
                </div>

                {/* Content blocks */}
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-bold">תכנים שיופיעו</legend>
                  <div className="grid grid-cols-3 gap-1.5">
                    {screenContentBlocks.map((content) => {
                      const selected = currentDesign.content_blocks.includes(content);
                      return (
                        <label
                          key={content}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-bold transition-colors ${
                            selected
                              ? "border-[var(--board-gold)] bg-[oklch(0.95_0.035_88)]"
                              : "border-border text-muted-foreground hover:border-[var(--board-gold-muted)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleContent(content)}
                            className="h-3.5 w-3.5 shrink-0 accent-primary"
                          />
                          {contentLabels[content]}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Layout picker */}
                <div className="grid gap-2">
                  <p className="text-sm font-bold">פריסת עמוד</p>
                  <LayoutPicker
                    value={currentDesign.layout}
                    onChange={(layout) => updateDesign({ layout })}
                  />
                </div>

                {/* Background swatches */}
                <div className="grid gap-2">
                  <p className="text-sm font-bold">תפאורת רקע</p>
                  <SwatchGrid
                    value={currentDesign.background_variant}
                    onChange={(background_variant) => updateDesign({ background_variant })}
                  />
                </div>

                {/* When to show + visibility + duration */}
                <div className="grid gap-2">
                  <p className="text-sm font-bold">מתי להציג</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specialDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => updateDesign({ special_day: day })}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                          currentDesign.special_day === day
                            ? "border-[var(--board-gold)] bg-[oklch(0.95_0.035_88)] text-foreground"
                            : "border-border text-muted-foreground hover:border-[var(--board-gold-muted)]"
                        }`}
                      >
                        {specialDayLabels[day]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="משך בשניות">
                    <TextInput
                      type="number"
                      min={4}
                      value={draft.duration_seconds}
                      onChange={(e) => update({ duration_seconds: Number(e.target.value) })}
                    />
                  </Field>
                  <label className="flex items-center justify-between gap-3 self-end rounded-md border border-border bg-background px-3 py-2.5 text-sm font-bold">
                    <span>הצג בסבב</span>
                    <input
                      type="checkbox"
                      checked={draft.is_visible}
                      onChange={(e) => update({ is_visible: e.target.checked })}
                      className="h-5 w-5 accent-primary"
                    />
                  </label>
                </div>

                {currentDesign.content_blocks.includes("halachot") && (
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-bold">
                    <div>
                      <span>המתן לסיום הגלילה</span>
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground">עבור להלכה הבאה רק לאחר שהגלילה הסתיימה</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!draft.config.scroll_until_done}
                      onChange={(e) => update({ config: { ...draft.config, scroll_until_done: e.target.checked } })}
                      className="h-5 w-5 shrink-0 accent-primary"
                    />
                  </label>
                )}

                {error ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>
                ) : null}
              </div>

              <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-border bg-background p-4">
                <Button onClick={() => void save()} disabled={saving}>
                  {saving ? "שומרים..." : "שמירת מסך"}
                </Button>
                <Button variant="outline" onClick={closeDialog}>
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        itemLabel={pendingDelete?.title ?? "מסך"}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}
