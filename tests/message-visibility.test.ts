import { describe, expect, it } from "vitest";
import { isMessageVisible, isWithinShowWindow, sortMessagesByUrgency } from "@/lib/messages/visibility";
import type { Message } from "@/types/domain";

const timezone = "Asia/Jerusalem";

function makeMessage(overrides: Partial<Message>): Message {
  return {
    id: "m-1",
    synagogue_id: "s-1",
    title: "הודעה",
    body: "תוכן",
    background_url: null,
    style: {},
    start_date: null,
    end_date: null,
    is_active: true,
    urgency: "regular",
    show_from: null,
    show_until: null,
    ...overrides,
  };
}

// 2026-07-19T09:00 Jerusalem time (UTC+3 in July).
const morning = new Date("2026-07-19T06:00:00.000Z");
// 22:00 Jerusalem time.
const night = new Date("2026-07-19T19:00:00.000Z");

describe("isWithinShowWindow", () => {
  it("is always visible without a window", () => {
    expect(isWithinShowWindow(null, null, morning, timezone)).toBe(true);
  });

  it("respects a same-day window", () => {
    expect(isWithinShowWindow("08:00", "12:00", morning, timezone)).toBe(true);
    expect(isWithinShowWindow("10:00", "12:00", morning, timezone)).toBe(false);
  });

  it("handles an overnight window that wraps past midnight", () => {
    expect(isWithinShowWindow("20:00", "06:00", night, timezone)).toBe(true);
    expect(isWithinShowWindow("20:00", "06:00", morning, timezone)).toBe(false);
  });

  it("supports open-ended windows", () => {
    expect(isWithinShowWindow("08:00", null, morning, timezone)).toBe(true);
    expect(isWithinShowWindow(null, "08:00", morning, timezone)).toBe(false);
  });
});

describe("isMessageVisible", () => {
  it("hides inactive messages", () => {
    expect(isMessageVisible(makeMessage({ is_active: false }), morning, timezone)).toBe(false);
  });

  it("hides expired messages", () => {
    expect(isMessageVisible(makeMessage({ end_date: "2026-07-01" }), morning, timezone)).toBe(false);
  });

  it("shows active in-range messages inside their window", () => {
    const message = makeMessage({ start_date: "2026-07-01", end_date: "2026-07-31", show_from: "08:00", show_until: "12:00" });
    expect(isMessageVisible(message, morning, timezone)).toBe(true);
    expect(isMessageVisible(message, night, timezone)).toBe(false);
  });
});

describe("sortMessagesByUrgency", () => {
  it("puts urgent messages first", () => {
    const sorted = sortMessagesByUrgency([
      makeMessage({ id: "a", urgency: "regular" }),
      makeMessage({ id: "b", urgency: "urgent" }),
      makeMessage({ id: "c", urgency: "important" }),
    ]);
    expect(sorted.map((message) => message.id)).toEqual(["b", "c", "a"]);
  });
});
