export interface ActiveAlert {
  id: string;
  cat: string;
  title: string;
  data: string[];
  desc: string;
}

export interface VisibleAlert {
  alert: ActiveAlert;
  isLocal: boolean;
  configuredCity: string;
  lastSeenAt: number;
  expiresAt: number;
}

export const ALERT_POLL_MS = 5_000;
export const CLIENT_ALERT_TIMEOUT_MS = 4_500;
export const LOCAL_ALERT_HOLD_MS = 10 * 60_000;
export const REMOTE_ALERT_HOLD_MS = 90_000;

export function parseActiveAlertText(text: string): ActiveAlert | null {
  const body = text.replace(/^\uFEFF/, "").trim();
  if (!body) return null;

  return parseActiveAlert(JSON.parse(body));
}

export function parseActiveAlert(value: unknown): ActiveAlert | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<ActiveAlert>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.cat !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.desc !== "string" ||
    !Array.isArray(candidate.data)
  ) {
    return null;
  }

  const data = candidate.data.filter((city): city is string => typeof city === "string" && city.trim().length > 0);
  if (!data.length) return null;

  return {
    id: candidate.id,
    cat: candidate.cat,
    title: candidate.title,
    desc: candidate.desc,
    data,
  };
}

export function matchesConfiguredAlertCity(alert: ActiveAlert, configuredCity: string | null | undefined): boolean {
  const configuredTerms = getAlertAreaTerms(configuredCity);
  if (!configuredTerms.length) return false;

  return alert.data.some((area) => {
    const areaTerms = getAlertAreaTerms(area);
    return configuredTerms.some((configured) => areaTerms.some((areaTerm) => areaTermMatches(areaTerm, configured)));
  });
}

export function nextVisibleAlertState(
  current: VisibleAlert | null,
  incoming: ActiveAlert | null,
  configuredCity: string | null | undefined,
  nowMs: number,
): VisibleAlert | null {
  const city = configuredCity?.trim() ?? "";
  const currentForCity = current?.configuredCity === city ? current : null;

  if (!incoming) return preserveVisibleAlertState(currentForCity, nowMs);

  const isLocal = matchesConfiguredAlertCity(incoming, city);
  if (isLocal) {
    return {
      alert: incoming,
      isLocal: true,
      configuredCity: city,
      lastSeenAt: nowMs,
      expiresAt: nowMs + LOCAL_ALERT_HOLD_MS,
    };
  }

  if (currentForCity?.isLocal && currentForCity.expiresAt > nowMs) return currentForCity;

  return {
    alert: incoming,
    isLocal: false,
    configuredCity: city,
    lastSeenAt: nowMs,
    expiresAt: nowMs + REMOTE_ALERT_HOLD_MS,
  };
}

export function preserveVisibleAlertState(
  current: VisibleAlert | null,
  nowMs: number,
  configuredCity?: string | null,
): VisibleAlert | null {
  if (configuredCity !== undefined && current?.configuredCity !== (configuredCity?.trim() ?? "")) return null;
  return current && current.expiresAt > nowMs ? current : null;
}

function getAlertAreaTerms(value: string | null | undefined): string[] {
  const normalized = normalizeAlertArea(value);
  if (!normalized) return [];

  const terms = new Set<string>([normalized]);
  const aliases = ALERT_AREA_ALIASES[normalized] ?? [];
  aliases.forEach((alias) => {
    const normalizedAlias = normalizeAlertArea(alias);
    if (normalizedAlias) terms.add(normalizedAlias);
  });

  return [...terms];
}

function normalizeAlertArea(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/[־\-–—_/.,;:()[\]{}"'״׳`]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("he-IL");
}

function areaTermMatches(areaTerm: string, configuredTerm: string): boolean {
  return containsWords(areaTerm, configuredTerm) || containsWords(configuredTerm, areaTerm);
}

function containsWords(value: string, term: string): boolean {
  return value === term || value.startsWith(`${term} `) || value.endsWith(` ${term}`) || value.includes(` ${term} `);
}

const ALERT_AREA_ALIASES: Record<string, string[]> = {
  [normalizeAlertArea("תל אביב - יפו")]: ["תל אביב"],
};
