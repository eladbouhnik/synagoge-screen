"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function BoardLinkCopy({ boardKey }: { boardKey: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/board/${boardKey}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — the visible path still lets the user copy manually.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      <span dir="ltr" className="font-mono text-xs">{path}</span>
    </button>
  );
}
