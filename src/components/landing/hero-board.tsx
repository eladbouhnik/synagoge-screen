"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { BoardPayload } from "@/types/domain";
import { BoardShell } from "@/components/board/board-shell";

const STAGE_WIDTH = 1600;
const STAGE_HEIGHT = 900;

// The real rotating board, scaled into the hero. Not a screenshot — the live thing.
export function HeroBoard({ payload }: { payload: BoardPayload }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? container.clientWidth;
      if (width > 0) setScale(width / STAGE_WIDTH);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border-2 border-[var(--board-gold-muted)] bg-[var(--board)] shadow-[0_32px_64px_-32px_oklch(0.15_0.03_255/0.6)]"
      style={{ aspectRatio: "16 / 9" }}
    >
      <div
        className="pointer-events-none absolute top-0 right-0 select-none"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top right",
        }}
        aria-hidden="true"
      >
        <div className="board-embed h-full overflow-hidden">
          <BoardShell boardKey="demo-board" initialPayload={payload} disableLocks />
        </div>
      </div>
    </div>
  );
}
