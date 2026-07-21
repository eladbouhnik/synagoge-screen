"use client";

import { ShieldAlert } from "lucide-react";

interface AlarmOverlayProps {
  title: string;
  desc: string;
  cities: string[];
}

export function AlarmOverlay({ title, desc, cities }: AlarmOverlayProps) {
  return (
    <div className="alarm-overlay absolute inset-0 z-50 flex flex-col items-center justify-center text-center px-8">
      <div className="alarm-ring mb-10 grid h-36 w-36 place-items-center rounded-full border-4 border-white/30">
        <ShieldAlert className="h-20 w-20 text-white" strokeWidth={1.25} />
      </div>
      <p className="text-3xl font-bold uppercase tracking-[0.25em] text-white/70">פיקוד העורף</p>
      <h1 className="mt-4 text-7xl font-black leading-tight text-white">{title}</h1>
      <div className="mt-2 h-1 w-24 rounded-full bg-white/40" />
      <p className="mt-6 text-4xl font-bold text-white/90 leading-snug max-w-3xl">{desc}</p>
      {cities.length > 0 && (
        <p className="mt-10 text-2xl text-white/60 max-w-4xl leading-relaxed">{cities.join(" · ")}</p>
      )}
    </div>
  );
}
