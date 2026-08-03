"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function YahrzeitQrBadge({ boardKey }: { boardKey: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/board/${boardKey}/yahrzeit-request`;
    let cancelled = false;
    void QRCode.toDataURL(url, { margin: 0, width: 96, color: { dark: "#000000", light: "#ffffff" } }).then((generated) => {
      if (!cancelled) setDataUrl(generated);
    });
    return () => {
      cancelled = true;
    };
  }, [boardKey]);

  if (!dataUrl) return null;

  return (
    <div className="flex items-center gap-2">
      <img src={dataUrl} alt="סרקו לבקשת עילוי נשמת" className="h-12 w-12 rounded-sm bg-white p-1" />
      <span className="text-lg">סריקה לבקשת עילוי נשמת</span>
    </div>
  );
}
