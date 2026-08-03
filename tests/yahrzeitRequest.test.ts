import { describe, expect, it } from "vitest";
import { validateYahrzeitRequest } from "@/lib/yahrzeitRequest";

const validInput = {
  boardKey: "demo-board",
  deceased_name: "רפאל בן מרים",
  gender: "זכר",
  parent_name: "מרים",
  hebrew_death_date: "י״ב תמוז",
  donor_name: "משפחת כהן",
  submitter_contact: "050-1234567",
};

describe("validateYahrzeitRequest", () => {
  it("accepts a fully filled request and trims optional fields", () => {
    const result = validateYahrzeitRequest({ ...validInput, donor_name: "  משפחת כהן  " });
    expect(result).toEqual({
      boardKey: "demo-board",
      deceased_name: "רפאל בן מרים",
      gender: "זכר",
      parent_name: "מרים",
      hebrew_death_date: "י״ב תמוז",
      donor_name: "משפחת כהן",
      submitter_contact: "050-1234567",
    });
  });

  it("accepts requests without optional donor name or contact", () => {
    const result = validateYahrzeitRequest({ ...validInput, donor_name: undefined, submitter_contact: undefined });
    expect(result?.donor_name).toBeNull();
    expect(result?.submitter_contact).toBeNull();
  });

  it("rejects a missing required field", () => {
    expect(validateYahrzeitRequest({ ...validInput, deceased_name: "" })).toBeNull();
    expect(validateYahrzeitRequest({ ...validInput, deceased_name: "   " })).toBeNull();
    expect(validateYahrzeitRequest({ ...validInput, parent_name: undefined })).toBeNull();
    expect(validateYahrzeitRequest({ ...validInput, boardKey: undefined })).toBeNull();
  });

  it("rejects an invalid gender value", () => {
    expect(validateYahrzeitRequest({ ...validInput, gender: "other" })).toBeNull();
    expect(validateYahrzeitRequest({ ...validInput, gender: undefined })).toBeNull();
  });

  it("truncates fields past their max length instead of rejecting", () => {
    const longName = "א".repeat(500);
    const result = validateYahrzeitRequest({ ...validInput, deceased_name: longName });
    expect(result?.deceased_name.length).toBe(200);
  });
});
