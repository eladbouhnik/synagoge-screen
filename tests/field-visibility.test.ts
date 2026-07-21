import { describe, expect, it } from "vitest";
import { isFieldVisible, type FieldDef } from "@/components/admin/resource-manager";

interface Row {
  id: string;
  time_mode: string;
  fixed_time: string | null;
  relative_to: string | null;
  day_type: string;
}

const fixedTimeField: FieldDef<Row> = {
  key: "fixed_time",
  label: "שעה קבועה",
  type: "time",
  visibleWhen: [{ field: "time_mode", equals: "fixed" }],
};

const daysField: FieldDef<Row> = {
  key: "relative_to",
  label: "יחסי אל",
  visibleWhen: [{ field: "day_type", in: ["weekday", "shabbat"] }],
};

describe("isFieldVisible", () => {
  it("shows fields without rules", () => {
    expect(isFieldVisible({ key: "time_mode", label: "מצב" } as FieldDef<Row>, {})).toBe(true);
  });

  it("matches equals rules against the draft", () => {
    expect(isFieldVisible(fixedTimeField, { time_mode: "fixed" })).toBe(true);
    expect(isFieldVisible(fixedTimeField, { time_mode: "relative" })).toBe(false);
  });

  it("matches in rules", () => {
    expect(isFieldVisible(daysField, { day_type: "weekday" })).toBe(true);
    expect(isFieldVisible(daysField, { day_type: "holiday" })).toBe(false);
  });

  it("requires all rules to pass (AND semantics)", () => {
    const field: FieldDef<Row> = {
      key: "fixed_time",
      label: "שעה",
      visibleWhen: [
        { field: "time_mode", equals: "fixed" },
        { field: "day_type", in: ["weekday"] },
      ],
    };
    expect(isFieldVisible(field, { time_mode: "fixed", day_type: "weekday" })).toBe(true);
    expect(isFieldVisible(field, { time_mode: "fixed", day_type: "shabbat" })).toBe(false);
  });
});
