"use client";

import { ShieldAlert } from "lucide-react";

interface AlertBannerProps {
  title: string;
  cities: string[];
}

export function AlertBanner({ title, cities }: AlertBannerProps) {
  const cityLine = cities.join(" · ");

  return (
    <div className="alert-banner-pill absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full px-5 py-3">
      <span className="alert-dot shrink-0 h-2.5 w-2.5 rounded-full bg-amber-400" />
      <ShieldAlert className="h-5 w-5 shrink-0 text-amber-300" strokeWidth={1.5} />
      <span className="text-base font-black text-amber-100 whitespace-nowrap">{title}</span>
      <span className="h-3.5 w-px shrink-0 bg-amber-400/30" />
      <span className="max-w-[360px] truncate text-sm text-amber-200/75">{cityLine}</span>
    </div>
  );
}
