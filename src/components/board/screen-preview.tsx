"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { BoardPayload, Screen } from "@/types/domain";
import { getScreenDesignConfig } from "@/lib/board/screen-config";
import { BoardFrame } from "./board-frame";
import { BoardScreen } from "./board-screen";

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;

interface ScreenPreviewProps {
  payload: BoardPayload;
  screen: Screen;
  className?: string;
}

// Live, read-only rendering of a single screen exactly as the board draws it,
// scaled down to fit its container (16:9).
export function ScreenPreview({ payload, screen, className = "" }: ScreenPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

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

  const design = getScreenDesignConfig(screen);
  const previewPayload: BoardPayload = { ...payload, screens: [screen] };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-lg border border-border bg-[var(--board)] ${className}`}
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
        <div className={`board-shell board-theme-${design.background_variant} relative h-full overflow-hidden text-board-foreground`}>
          <BoardFrame synagogue={payload.synagogue} frameClassName="h-full p-14">
            <BoardScreen payload={previewPayload} screen={screen} now={new Date()} />
          </BoardFrame>
        </div>
      </div>
    </div>
  );
}
