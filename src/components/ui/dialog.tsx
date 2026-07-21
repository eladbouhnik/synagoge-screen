"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, subtitle, maxWidth = "max-w-2xl", children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === ref.current) onClose();
  }

  return (
    <dialog
      ref={ref}
      dir="rtl"
      onClose={onClose}
      onClick={handleBackdropClick}
      className={`ui-dialog w-[calc(100vw-2rem)] ${maxWidth} rounded-xl border border-border bg-background p-0 text-foreground shadow-2xl`}
    >
      {open ? (
        <div className="flex max-h-[85dvh] flex-col">
          {title ? (
            <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <h2 className="text-xl font-black">{title}</h2>
                {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="סגירה"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
