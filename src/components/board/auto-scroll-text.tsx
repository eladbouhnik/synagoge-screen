"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Slow readable pace for a wall display; the animation alternates down and back up.
const pixelsPerSecond = 18;
const minDurationSeconds = 8;

interface AutoScrollTextProps {
  text: string;
  className?: string;
  textClassName?: string;
  onScrollDuration?: (seconds: number | null) => void;
}

export function AutoScrollText({ text, className, textClassName, onScrollDuration }: AutoScrollTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [scroll, setScroll] = useState<{ distance: number; duration: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      const overflow = content.scrollHeight - container.clientHeight;
      const next = overflow > 8 ? { distance: overflow, duration: Math.max(overflow / pixelsPerSecond, minDurationSeconds) } : null;
      setScroll(next);
      onScrollDuration?.(next?.duration ?? null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [text, onScrollDuration]);

  return (
    <div ref={containerRef} className={`board-scroll-container${className ? ` ${className}` : ""}`}>
      <p
        ref={contentRef}
        className={`${textClassName ?? ""}${scroll ? " board-scroll-content" : ""}`.trim() || undefined}
        style={scroll ? ({ "--scroll-distance": `${-scroll.distance}px`, "--scroll-duration": `${scroll.duration}s` } as CSSProperties) : undefined}
      >
        {text}
      </p>
    </div>
  );
}
