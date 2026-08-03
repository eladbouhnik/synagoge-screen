"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function YahrzeitQrBadge({ boardKey }: { boardKey: string }) {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/board/${boardKey}/yahrzeit-request`;
    let cancelled = false;
    // SVG string rendering (not toDataURL's canvas path) so browsers that
    // block/poison Canvas for anti-fingerprinting (Brave, uBlock, Firefox
    // strict mode) still produce a scannable code.
    void QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#000000", light: "#ffffff" } }).then((generated) => {
      if (!cancelled) setSvgMarkup(generated);
    });
    return () => {
      cancelled = true;
    };
  }, [boardKey]);

  if (!svgMarkup) return null;

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-12 w-12 rounded-sm bg-white p-1 [&_svg]:h-full [&_svg]:w-full"
        role="img"
        aria-label="סרקו לבקשת עילוי נשמת"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
      <span className="text-lg">סריקה לבקשת עילוי נשמת</span>
    </div>
  );
}
