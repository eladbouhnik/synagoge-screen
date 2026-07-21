"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  itemLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({ open, itemLabel, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="max-w-md">
      {step === 1 ? (
        <div className="grid gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
              <Trash2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black">מחיקת רשומה</h2>
              <p className="text-sm text-muted-foreground">האם למחוק את &ldquo;{itemLabel}&rdquo;?</p>
            </div>
          </div>
          <div className="flex justify-start gap-2">
            <Button variant="danger" onClick={() => setStep(2)}>
              מחיקה
            </Button>
            <Button variant="outline" onClick={onCancel}>
              ביטול
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-red-700">אישור סופי</h2>
              <p className="text-sm text-muted-foreground">
                הפעולה אינה הפיכה. &ldquo;{itemLabel}&rdquo; תימחק לצמיתות.
              </p>
            </div>
          </div>
          <div className="flex justify-start gap-2">
            <Button variant="danger" onClick={onConfirm}>
              מחיקה לצמיתות
            </Button>
            <Button variant="outline" onClick={onCancel}>
              ביטול
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
