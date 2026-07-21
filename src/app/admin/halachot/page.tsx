"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, PenLine } from "lucide-react";
import { ResourceManager } from "@/components/admin/resource-manager";
import { demoHalachot, demoSettings } from "@/lib/demo-data";
import { sourceLabels, type DailyLearningItem } from "@/lib/halacha/daily-learning";
import type { BoardSettings, HalachaAutoSource, HalachaMode } from "@/types/domain";

const SETTINGS_KEY = "admin:board-settings";

function broadcastDemoChange() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && "BroadcastChannel" in window) {
    const channel = new BroadcastChannel("board:demo-board");
    channel.postMessage({ resource: "board-settings" });
    channel.close();
  }
}

interface HalachaSourceToggleProps {
  mode: HalachaMode;
  source: HalachaAutoSource;
  onChange: (mode: HalachaMode) => void;
  onSourceChange: (source: HalachaAutoSource) => void;
}

function HalachaSourceToggle({ mode, source, onChange, onSourceChange }: HalachaSourceToggleProps) {
  const [preview, setPreview] = useState<DailyLearningItem[]>([]);

  useEffect(() => {
    let current = true;
    fetch("/api/daily-learning")
      .then((response) => response.json() as Promise<{ items?: DailyLearningItem[] }>)
      .then((data) => { if (current) setPreview((data.items ?? []).slice(0, 3)); })
      .catch(() => undefined);
    return () => { current = false; };
  }, []);

  return (
    <div className="grid gap-3">
      <h3 className="text-lg font-black">מקור ההלכה היומית</h3>
      <div className="grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("auto")}
          aria-pressed={mode === "auto"}
          className={`grid content-start gap-2 rounded-xl border-2 p-5 text-right transition-colors ${mode === "auto" ? "border-[var(--board-gold)] bg-[oklch(0.97_0.02_88)]" : "border-border bg-background hover:border-[var(--board-gold-muted)]"}`}
        >
          <span className="flex items-center gap-2 font-black">
            <BookOpenCheck className="h-5 w-5 text-[var(--accent)]" />
            אוטומטי — הלכה יומית מתעדכנת
          </span>
          <span className="text-sm text-muted-foreground">
            ההלכה היומית מהמסלול שתבחרו — מתעדכנת כל יום לבד, בלי תחזוקה.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("manual")}
          aria-pressed={mode === "manual"}
          className={`grid content-start gap-2 rounded-xl border-2 p-5 text-right transition-colors ${mode === "manual" ? "border-[var(--board-gold)] bg-[oklch(0.97_0.02_88)]" : "border-border bg-background hover:border-[var(--board-gold-muted)]"}`}
        >
          <span className="flex items-center gap-2 font-black">
            <PenLine className="h-5 w-5 text-[var(--accent)]" />
            מאגר אישי — הלכות משלכם
          </span>
          <span className="text-sm text-muted-foreground">
            הלוח מציג רק הלכות שאתם כותבים ובוחרים במאגר שלמטה.
          </span>
        </button>
      </div>

      {mode === "auto" ? (
        <div className="grid gap-2">
          <span className="text-sm font-black">איזה מסלול לימוד יוצג על הלוח?</span>
          <div className="grid gap-3 lg:grid-cols-3">
            {(Object.keys(sourceLabels) as HalachaAutoSource[]).map((category) => {
              const todayItem = preview.find((item) => item.category === category);
              const active = source === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSourceChange(category)}
                  aria-pressed={active}
                  className={`flex flex-col items-stretch gap-1.5 rounded-lg border-2 p-3 text-right text-sm transition-colors ${active ? "border-[var(--board-gold)] bg-[oklch(0.97_0.02_88)]" : "border-border bg-background hover:border-[var(--board-gold-muted)]"}`}
                >
                  <span className="line-clamp-1 font-bold">{sourceLabels[category]}</span>
                  {todayItem ? (
                    <>
                      <span className="line-clamp-1 text-xs text-muted-foreground">היום: {todayItem.title}</span>
                      <span className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {todayItem.body || "אין תוכן זמין מהמקור עבור היום."}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">טוען...</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HalachotPage() {
  const [mode, setMode] = useState<HalachaMode>("auto");
  const [autoSource, setAutoSource] = useState<HalachaAutoSource>("kitzurShulchanAruch");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const stored = window.localStorage.getItem(SETTINGS_KEY);
        const settings = stored ? ({ ...demoSettings, ...JSON.parse(stored) } as BoardSettings) : demoSettings;
        if (!cancelled) {
          setMode(settings.halacha_mode ?? "auto");
          setAutoSource(settings.halacha_auto_source ?? "kitzurShulchanAruch");
        }
      } else {
        try {
          const response = await fetch("/api/admin/board-settings", { cache: "no-store" });
          const payload = (await response.json()) as { rows?: BoardSettings[] };
          if (!cancelled && payload.rows?.[0]) {
            setMode(payload.rows[0].halacha_mode ?? "auto");
            setAutoSource(payload.rows[0].halacha_auto_source ?? "kitzurShulchanAruch");
          }
        } catch {
          // keep default
        }
      }
      if (!cancelled) setLoaded(true);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function saveSettings(patch: Partial<Pick<BoardSettings, "halacha_mode" | "halacha_auto_source">>) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const stored = window.localStorage.getItem(SETTINGS_KEY);
      const settings = stored ? { ...demoSettings, ...JSON.parse(stored) } : { ...demoSettings };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, ...patch }));
      broadcastDemoChange();
      return;
    }
    await fetch("/api/admin/board-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => undefined);
  }

  function changeMode(nextMode: HalachaMode) {
    setMode(nextMode);
    void saveSettings({ halacha_mode: nextMode });
  }

  function changeSource(nextSource: HalachaAutoSource) {
    setAutoSource(nextSource);
    void saveSettings({ halacha_auto_source: nextSource });
  }

  return (
    <div className="grid gap-8">
      {loaded ? <HalachaSourceToggle mode={mode} source={autoSource} onChange={changeMode} onSourceChange={changeSource} /> : null}

      <div className={mode === "auto" ? "opacity-60" : undefined}>
        {mode === "auto" ? (
          <p className="mb-3 rounded-md bg-muted px-4 py-2.5 text-sm text-muted-foreground">
            המצב האוטומטי פעיל — המאגר האישי שמור אך אינו מוצג על הלוח.
          </p>
        ) : null}
        <ResourceManager
          title="הלכות"
          subtitle="מאגר הלכות אישי להצגה יומית"
          storageKey="admin:halachot"
          resource="halachot"
          initialRows={demoHalachot}
          listColumns={["category", "body", "is_selected"]}
          fields={[
            { key: "category", label: "קטגוריה" },
            { key: "body", label: "טקסט ההלכה", type: "textarea" },
            { key: "holiday_tag", label: "תג חג", hint: "השאירו ריק להצגה בכל יום" },
            { key: "is_selected", label: "נבחר להצגה", type: "checkbox" },
          ]}
          newRow={{ category: "", body: "", holiday_tag: null, is_selected: true }}
          validateRow={(row) => (!row.body?.trim() ? "יש להזין את טקסט ההלכה." : null)}
        />
      </div>
    </div>
  );
}
