"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";

export interface FieldDef<T extends { id: string }> {
  key: keyof T;
  label: string;
  type?: "text" | "textarea" | "number" | "time" | "date" | "checkbox";
}

interface ResourceManagerProps<T extends { id: string }> {
  title: string;
  subtitle: string;
  storageKey: string;
  resource: string;
  initialRows: T[];
  fields: FieldDef<T>[];
}

export function ResourceManager<T extends { id: string }>({
  title,
  subtitle,
  storageKey,
  resource,
  initialRows,
  fields,
}: ResourceManagerProps<T>) {
  const [rows, setRows] = useState<T[]>(() => {
    if (typeof window === "undefined") return initialRows;
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as T[]) : initialRows;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(() => rows.find((row) => row.id === editingId) ?? rows[0], [editingId, rows]);

  const persist = useCallback((nextRows: T[]) => {
    setRows(nextRows);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRows));
  }, [storageKey]);

  async function updateRow(formData: FormData) {
    const id = String(formData.get("id") ?? crypto.randomUUID());
    const row = Object.fromEntries(fields.map((field) => {
      const rawValue = formData.get(String(field.key));
      const value = field.type === "checkbox" ? rawValue === "on" : field.type === "number" ? Number(rawValue) : rawValue;
      return [field.key, value];
    })) as Partial<T>;
    const nextRow = { ...(rows.find((item) => item.id === id) ?? rows[0]), ...row, id } as T;
    const exists = rows.some((item) => item.id === id);
    setError(null);

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

    persist(exists ? rows.map((item) => (item.id === id ? nextRow : item)) : [nextRow, ...rows]);
    setEditingId(id);
  }

  async function removeRow(id: string) {
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
        return;
      }
    }
    persist(rows.filter((row) => row.id !== id));
    setEditingId(null);
  }

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

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <h2 className="mt-1 text-4xl font-black">{title}</h2>
        </div>
        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
        <button
          type="button"
          onClick={() => setEditingId(null)}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          רשומה חדשה
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-right">
            <thead className="bg-muted text-sm text-muted-foreground">
              <tr>
                {fields.slice(0, 3).map((field) => (
                  <th key={String(field.key)} className="px-4 py-3 font-bold">{field.label}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  {fields.slice(0, 3).map((field) => (
                  <td key={String(field.key)} className="max-w-xs truncate px-4 py-3">{String(row[field.key] ?? "")}</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingId(row.id)} className="rounded-md border border-border p-2" aria-label="עריכה">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeRow(row.id)} className="rounded-md border border-border p-2" aria-label="מחיקה">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={updateRow} className="rounded-lg border border-border bg-muted p-5">
          <input type="hidden" name="id" value={active?.id ?? ""} />
          <div className="grid gap-4">
            {fields.map((field) => (
              <label key={String(field.key)} className="grid gap-1.5 text-sm font-bold">
                {field.label}
                {field.type === "textarea" ? (
                  <textarea name={String(field.key)} defaultValue={String(active?.[field.key] ?? "")} className="min-h-28 rounded-md border border-border bg-background p-3 font-normal" />
                ) : field.type === "checkbox" ? (
                  <input name={String(field.key)} type="checkbox" defaultChecked={Boolean(active?.[field.key])} className="h-5 w-5 accent-primary" />
                ) : (
                  <input name={String(field.key)} type={field.type ?? "text"} defaultValue={String(active?.[field.key] ?? "")} className="h-11 rounded-md border border-border bg-background px-3 font-normal" />
                )}
              </label>
            ))}
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 font-bold text-primary-foreground">
              <Check className="h-4 w-4" />
              שמירה
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
