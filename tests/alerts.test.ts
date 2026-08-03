import { describe, expect, it } from "vitest";
import {
  LOCAL_ALERT_HOLD_MS,
  REMOTE_ALERT_HOLD_MS,
  matchesConfiguredAlertCity,
  nextVisibleAlertState,
  parseActiveAlert,
  parseActiveAlertText,
  preserveVisibleAlertState,
  type ActiveAlert,
} from "@/lib/alerts";

const baseAlert: ActiveAlert = {
  id: "123",
  cat: "1",
  title: "ירי רקטות וטילים",
  data: ["צפת"],
  desc: "היכנסו למרחב המוגן מיד",
};

describe("red alert integration helpers", () => {
  it("parses empty Home Front Command responses as no active alert", () => {
    expect(parseActiveAlertText("\uFEFF\r\n")).toBeNull();
  });

  it("rejects malformed alert payloads", () => {
    expect(parseActiveAlert({ id: "1", data: ["צפת"] })).toBeNull();
    expect(parseActiveAlert({ ...baseAlert, data: [] })).toBeNull();
  });

  it("normalizes official area names before matching the configured city", () => {
    expect(matchesConfiguredAlertCity({ ...baseAlert, data: [" צְפַת "] }, "צפת")).toBe(true);
    expect(matchesConfiguredAlertCity({ ...baseAlert, data: ["תל אביב - דרום העיר ויפו"] }, "תל אביב - יפו")).toBe(true);
    expect(matchesConfiguredAlertCity({ ...baseAlert, data: ["רמת גן"] }, "גן יבנה")).toBe(false);
  });

  it("keeps a local alert visible through empty or failed polls", () => {
    const now = 10_000;
    const visible = nextVisibleAlertState(null, baseAlert, "צפת", now);

    expect(visible?.isLocal).toBe(true);
    expect(visible?.expiresAt).toBe(now + LOCAL_ALERT_HOLD_MS);
    expect(nextVisibleAlertState(visible, null, "צפת", now + 5_000)).toBe(visible);
    expect(preserveVisibleAlertState(visible, now + 5_000)).toBe(visible);
    expect(preserveVisibleAlertState(visible, now + LOCAL_ALERT_HOLD_MS + 1)).toBeNull();
  });

  it("does not let a remote alert replace an active local overlay", () => {
    const now = 10_000;
    const local = nextVisibleAlertState(null, baseAlert, "צפת", now);
    const remote = nextVisibleAlertState(local, { ...baseAlert, id: "456", data: ["חיפה"] }, "צפת", now + 1_000);

    expect(remote).toBe(local);
  });

  it("keeps remote alert banners short lived", () => {
    const now = 10_000;
    const remote = nextVisibleAlertState(null, { ...baseAlert, data: ["חיפה"] }, "צפת", now);

    expect(remote?.isLocal).toBe(false);
    expect(remote?.expiresAt).toBe(now + REMOTE_ALERT_HOLD_MS);
  });
});
