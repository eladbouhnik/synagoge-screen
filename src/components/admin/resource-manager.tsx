"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Checkbox, Field, Select, TextInput, Textarea } from "@/components/ui/field";

export interface FieldRule<T> {
  field: keyof T;
  equals?: unknown;
  in?: unknown[];
  truthy?: boolean;
}

export interface FieldDef<T extends { id: string }> {
  key: keyof T;
  label: string;
  type?: "text" | "textarea" | "number" | "time" | "date" | "checkbox" | "select" | "weekday-selector" | "tag-list" | "config-select" | "radio";
  options?: { value: string; label: string }[];
  configKey?: string;
  required?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  visibleWhen?: FieldRule<T>[];
  hiddenResetValue?: unknown;
  sectionStart?: string;
}

interface ResourceManagerProps<T extends { id: string }> {
  title: string;
  subtitle: string;
  storageKey: string;
  resource: string;
  initialRows: T[];
  fields: FieldDef<T>[];
  newRow?: Partial<T>;
  validateRow?: (row: T) => string | null;
  listColumns?: (keyof T)[];
  rowBadge?: (row: T) => { label: string; tone: BadgeTone } | null;
  isRowMuted?: (row: T) => boolean;
  getCellDisplay?: (key: keyof T, row: T) => string | undefined;
  renderList?: (rows: T[], onEdit: (row: T) => void, onDelete: (row: T) => void) => React.ReactNode;
}

type DraftValues = Record<string, unknown>;

export function isFieldVisible<T extends { id: string }>(field: FieldDef<T>, draft: DraftValues): boolean {
  if (!field.visibleWhen?.length) return true;
  return field.visibleWhen.every((rule) => {
    const value = draft[String(rule.field)];
    if (rule.in) return rule.in.some((candidate) => candidate === value);
    if (rule.truthy !== undefined) return Boolean(value) === rule.truthy;
    return value === rule.equals;
  });
}

// Converts a stored row into editable form values (arrays -> comma strings, etc.).
function toDraftValues<T extends { id: string }>(row: Partial<T>, fields: FieldDef<T>[]): DraftValues {
  const draft: DraftValues = { ...row };
  for (const field of fields) {
    const value = row[field.key];
    if (field.type === "tag-list") draft[String(field.key)] = Array.isArray(value) ? value.join(", ") : "";
  }
  return draft;
}

function coerceFieldValue<T extends { id: string }>(field: FieldDef<T>, raw: unknown, existingValue: unknown): unknown {
  switch (field.type) {
    case "checkbox":
      return Boolean(raw);
    case "number":
      return raw === "" || raw === null || raw === undefined ? 0 : Number(raw);
    case "weekday-selector":
      return Array.isArray(raw) ? raw : [];
    case "tag-list":
      return String(raw ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    case "config-select":
      return { ...(isRecord(existingValue) ? existingValue : {}), [field.configKey ?? "value"]: raw ?? "" };
    case "time":
    case "date":
    case "select":
      return raw === "" || raw === undefined ? null : raw;
    default:
      return raw ?? "";
  }
}

export function ResourceManager<T extends { id: string }>({
  title,
  subtitle,
  storageKey,
  resource,
  initialRows,
  fields,
  newRow,
  validateRow,
  listColumns,
  rowBadge,
  isRowMuted,
  getCellDisplay,
  renderList,
}: ResourceManagerProps<T>) {
  const [rows, setRows] = useState<T[]>(() => {
    if (typeof window === "undefined") return initialRows;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as T[]) : initialRows;
  });
  const [draft, setDraft] = useState<DraftValues | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const columns = listColumns ?? fields.slice(0, 3).map((field) => field.key);

  // rows is a snapshot taken at mount; another tab (or this one, earlier) may have
  // written newer data since. Re-reading right before a write keeps a stale local
  // copy from clobbering rows that changed out from under this one.
  const latestRows = useCallback((): T[] => {
    if (typeof window === "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL) return rows;
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as T[]) : rows;
  }, [rows, storageKey]);

  const persist = useCallback((nextRows: T[]) => {
    setRows(nextRows);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRows));
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("board:demo-board");
      channel.postMessage({ resource, storageKey });
      channel.close();
    }
  }, [resource, storageKey]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    let cancelled = false;
    async function loadRemoteRows() {
      const response = await fetch(`/api/admin/${resource}`, { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as { rows?: T[] };
      if (payload.rows) persist(payload.rows);
    }

    void loadRemoteRows();
    return () => {
      cancelled = true;
    };
  }, [persist, resource]);

  function openNew() {
    setError(null);
    setDraft(toDraftValues({ ...(newRow ?? {}), id: crypto.randomUUID() } as Partial<T>, fields));
  }

  function openEdit(row: T) {
    setError(null);
    setDraft(toDraftValues(row, fields));
  }

  function closeDialog() {
    setDraft(null);
    setError(null);
  }

  function setField(key: string, value: unknown) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveDraft() {
    if (!draft) return;
    const id = String(draft.id);
    const existing = rows.find((item) => item.id === id);

    const coerced: DraftValues = {};
    for (const field of fields) {
      const key = String(field.key);
      if (isFieldVisible(field, draft)) {
        coerced[key] = coerceFieldValue(field, draft[key], existing?.[field.key]);
      } else {
        // Reset hidden fields so stale values (e.g. relative_to after switching to
        // fixed time) never persist and leak into the zmanim resolver.
        coerced[key] = field.hiddenResetValue ?? (newRow as DraftValues | undefined)?.[key] ?? null;
      }
    }

    const nextRow = { ...(existing ?? newRow ?? {}), ...coerced, id } as T;
    setError(null);
    const validationError = validateRow?.(nextRow);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const response = await fetch(`/api/admin/${resource}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextRow),
        });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          setError(payload.error ?? "שמירה נכשלה");
          return;
        }
      }
      const latest = latestRows();
      const exists = latest.some((item) => item.id === id);
      persist(exists ? latest.map((item) => (item.id === id ? nextRow : item)) : [nextRow, ...latest]);
      closeDialog();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setError(null);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const response = await fetch(`/api/admin/${resource}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "מחיקה נכשלה");
        setPendingDelete(null);
        return;
      }
    }
    persist(latestRows().filter((row) => row.id !== id));
    setPendingDelete(null);
  }

  const isNewDraft = draft ? !rows.some((row) => row.id === draft.id) : false;
  const firstFieldKey = fields[0]?.key;

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <h2 className="mt-1 text-4xl font-black">{title}</h2>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          רשומה חדשה
        </Button>
      </div>

      {error && !draft ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {rows.length === 0 ? (
          <div className="grid place-items-center gap-3 px-6 py-16 text-center">
            <p className="font-black">עדיין אין רשומות</p>
            <p className="max-w-sm text-sm text-muted-foreground">לחצו על &ldquo;רשומה חדשה&rdquo; כדי להוסיף את הרשומה הראשונה.</p>
            <Button variant="outline" onClick={openNew}>
              <Plus className="h-4 w-4" />
              רשומה חדשה
            </Button>
          </div>
        ) : renderList ? (
          renderList(rows, openEdit, setPendingDelete)
        ) : (
          <table className="w-full text-right">
            <thead className="border-b border-border text-sm text-muted-foreground">
              <tr>
                {columns.map((key) => (
                  <th key={String(key)} className="px-4 py-3 font-bold">
                    {fields.find((field) => field.key === key)?.label ?? String(key)}
                  </th>
                ))}
                {rowBadge ? <th className="px-4 py-3" /> : null}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const badge = rowBadge?.(row) ?? null;
                const muted = isRowMuted?.(row) ?? false;
                return (
                  <tr key={row.id} className={muted ? "opacity-50" : undefined}>
                    {columns.map((key) => {
                      const field = fields.find((item) => item.key === key);
                      const isLongText = field?.type === "textarea";
                      return (
                        <td
                          key={String(key)}
                          className={isLongText ? "max-w-md whitespace-normal px-4 py-3 text-sm text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]" : "max-w-xs truncate px-4 py-3"}
                        >
                          {field ? (getCellDisplay?.(key, row) ?? displayValue(field, row)) : String(row[key] ?? "")}
                        </td>
                      );
                    })}
                    {rowBadge ? (
                      <td className="px-4 py-3">{badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null}</td>
                    ) : null}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-[var(--board-gold)] hover:text-foreground"
                          aria-label="עריכה"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(row)}
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
        )}
      </div>

      <Dialog
        open={draft !== null}
        onClose={closeDialog}
        title={isNewDraft ? `${title} — רשומה חדשה` : `${title} — עריכה`}
        maxWidth="max-w-3xl"
      >
        {draft ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveDraft();
            }}
          >
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {fields.filter((field) => isFieldVisible(field, draft)).map((field) => {
                const key = String(field.key);
                const value = draft[key];
                const wide = field.type === "textarea" || field.type === "weekday-selector" || field.type === "radio";
                return (
                  <div key={key} className={`contents`}>
                    {field.sectionStart ? (
                      <div className="sm:col-span-2 border-t border-border pb-1 pt-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{field.sectionStart}</p>
                      </div>
                    ) : null}
                  <Field label={field.label} hint={field.hint} className={wide ? "sm:col-span-2" : undefined}>
                    {field.type === "textarea" ? (
                      <Textarea value={String(value ?? "")} onChange={(event) => setField(key, event.target.value)} />
                    ) : field.type === "checkbox" ? (
                      <Checkbox checked={Boolean(value)} onChange={(event) => setField(key, event.target.checked)} />
                    ) : field.type === "select" ? (
                      <Select value={String(value ?? "")} onChange={(event) => setField(key, event.target.value)}>
                        <option value="">בחרו</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Select>
                    ) : field.type === "config-select" ? (
                      <Select
                        value={getConfigValue(value, field.configKey)}
                        onChange={(event) =>
                          setField(key, { ...(isRecord(value) ? value : {}), [field.configKey ?? "value"]: event.target.value })
                        }
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Select>
                    ) : field.type === "weekday-selector" ? (
                      <span className="flex flex-wrap gap-2 rounded-md border border-border bg-background p-3 font-normal">
                        {field.options?.map((option) => {
                          const selected = Array.isArray(value) && (value as unknown[]).includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition-colors ${selected ? "border-[var(--board-gold)] bg-[oklch(0.95_0.035_88)]" : "border-border text-muted-foreground"}`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={selected}
                                onChange={(event) => {
                                  const current = Array.isArray(value) ? (value as string[]) : [];
                                  setField(key, event.target.checked ? [...current, option.value] : current.filter((item) => item !== option.value));
                                }}
                              />
                              {option.label}
                            </label>
                          );
                        })}
                      </span>
                    ) : field.type === "tag-list" ? (
                      <TextInput value={String(value ?? "")} placeholder="פסח, ראש השנה" onChange={(event) => setField(key, event.target.value)} />
                    ) : field.type === "radio" ? (
                      <span className="flex flex-wrap gap-2 rounded-md border border-border bg-background p-3 font-normal">
                        {field.options?.map((option) => {
                          const selected = value === option.value;
                          return (
                            <label
                              key={option.value}
                              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition-colors ${selected ? "border-[var(--board-gold)] bg-[oklch(0.95_0.035_88)]" : "border-border text-muted-foreground"}`}
                            >
                              <input
                                type="radio"
                                className="sr-only"
                                checked={selected}
                                onChange={() => setField(key, option.value)}
                              />
                              {option.label}
                            </label>
                          );
                        })}
                      </span>
                    ) : (
                      <TextInput
                        type={field.type ?? "text"}
                        value={value === null || value === undefined ? "" : String(value)}
                        min={field.min}
                        max={field.max}
                        onChange={(event) => setField(key, event.target.value)}
                      />
                    )}
                  </Field>
                  </div>
                );
              })}
            </div>
            {error ? (
              <p className="mx-6 mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>
            ) : null}
            <footer className="sticky bottom-0 flex justify-start gap-2 border-t border-border bg-background px-6 py-4">
              <Button type="submit" disabled={saving}>
                {saving ? "שומרים..." : "שמירה"}
              </Button>
              <Button variant="outline" onClick={closeDialog}>
                ביטול
              </Button>
            </footer>
          </form>
        ) : null}
      </Dialog>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        itemLabel={pendingDelete && firstFieldKey ? String(pendingDelete[firstFieldKey] ?? "רשומה") : "רשומה"}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}

function displayValue<T extends { id: string }>(field: FieldDef<T>, row: T) {
  const value = row[field.key];
  if (field.type === "checkbox") return value ? "פעיל" : "כבוי";
  if (Array.isArray(value)) {
    return value
      .map((item) => field.options?.find((option) => option.value === String(item))?.label ?? String(item))
      .join(", ");
  }
  const option = field.options?.find((item) => item.value === String(value));
  return option?.label ?? String(value ?? "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getConfigValue(value: unknown, key: string | undefined): string {
  const candidate = isRecord(value) ? value[key ?? ""] : null;
  return typeof candidate === "string" ? candidate : "";
}
