import { describe, expect, it } from "vitest";
import { demoScreens } from "@/lib/demo-data";
import { getScreenDesignConfig, isComposedScreen, isScreenActiveForDay, screenBackgrounds, screenLayouts, specialDays } from "@/lib/board/screen-config";

describe("screen design configuration", () => {
  it("offers the full design choice set", () => {
    expect(screenBackgrounds).toHaveLength(25);
    expect(screenLayouts).toHaveLength(11);
    expect(specialDays).toEqual(["all", "weekday", "shabbat", "holiday"]);
  });

  it("uses a safe design for legacy screens", () => {
    const design = getScreenDesignConfig(demoScreens[0]!);

    expect(design.content_blocks).toEqual(["tfilot"]);
    expect(design.background_variant).toBe("parochet");
    expect(design.layout).toBe("feature");
    expect(isComposedScreen(demoScreens[0]!)).toBe(false);
  });

  it("preserves a chosen multi-content design", () => {
    const screen = {
      ...demoScreens[0]!,
      config: {
        background_variant: "mosaic",
        layout: "poster",
        content_blocks: ["messages", "shiurim", "clock"],
        special_day: "shabbat",
      },
    };
    const design = getScreenDesignConfig(screen);

    expect(design).toMatchObject({ background_variant: "mosaic", layout: "poster", special_day: "shabbat" });
    expect(design.content_blocks).toEqual(["messages", "shiurim", "clock"]);
    expect(isComposedScreen(screen)).toBe(true);
  });

  it("shows Shabbat screens on Friday and Saturday only", () => {
    const screen = { ...demoScreens[0]!, config: { special_day: "shabbat" } };

    expect(isScreenActiveForDay(screen, new Date("2026-07-17T12:00:00.000Z"))).toBe(true);
    expect(isScreenActiveForDay(screen, new Date("2026-07-18T12:00:00.000Z"))).toBe(true);
    expect(isScreenActiveForDay(screen, new Date("2026-07-16T12:00:00.000Z"))).toBe(false);
  });
});
