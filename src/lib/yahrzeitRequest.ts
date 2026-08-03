export interface YahrzeitRequestInput {
  boardKey?: unknown;
  deceased_name?: unknown;
  gender?: unknown;
  parent_name?: unknown;
  hebrew_death_date?: unknown;
  donor_name?: unknown;
  submitter_contact?: unknown;
}

export interface ValidatedYahrzeitRequest {
  boardKey: string;
  deceased_name: string;
  gender: "זכר" | "נקבה";
  parent_name: string;
  hebrew_death_date: string;
  donor_name: string | null;
  submitter_contact: string | null;
}

function cleanRequired(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : null;
}

function cleanOptional(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : null;
}

export function validateYahrzeitRequest(input: YahrzeitRequestInput): ValidatedYahrzeitRequest | null {
  const boardKey = cleanRequired(input.boardKey, 100);
  const deceasedName = cleanRequired(input.deceased_name, 200);
  const parentName = cleanRequired(input.parent_name, 200);
  const hebrewDeathDate = cleanRequired(input.hebrew_death_date, 100);
  const gender = input.gender === "זכר" || input.gender === "נקבה" ? input.gender : null;

  if (!boardKey || !deceasedName || !parentName || !hebrewDeathDate || !gender) return null;

  return {
    boardKey,
    deceased_name: deceasedName,
    gender,
    parent_name: parentName,
    hebrew_death_date: hebrewDeathDate,
    donor_name: cleanOptional(input.donor_name, 200),
    submitter_contact: cleanOptional(input.submitter_contact, 150),
  };
}
