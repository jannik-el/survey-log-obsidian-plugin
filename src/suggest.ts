/**
 * Pure suggestion ranking/filtering used by the modal's location and
 * note fields. Matching is case-insensitive; prefix matches rank
 * before substring matches.
 */

export interface FrequencyEntry {
  text: string;
  /** How often the text has been used. */
  count: number;
  /** Position of the most recent use (higher = more recent). */
  lastSeen: number;
}

/**
 * Build a frequency index from note texts in usage order (oldest
 * first). Texts differing only in case are merged onto the most
 * frequent casing.
 */
export function buildFrequencyIndex(texts: string[]): FrequencyEntry[] {
  const byKey = new Map<string, { casings: Map<string, number>; count: number; lastSeen: number }>();
  texts.forEach((text, i) => {
    const key = text.toLowerCase();
    const entry = byKey.get(key) ?? { casings: new Map(), count: 0, lastSeen: -1 };
    entry.casings.set(text, (entry.casings.get(text) ?? 0) + 1);
    entry.count += 1;
    entry.lastSeen = i;
    byKey.set(key, entry);
  });
  return [...byKey.values()].map((e) => {
    let bestCasing = "";
    let bestCount = -1;
    for (const [casing, count] of e.casings) {
      if (count > bestCount) {
        bestCasing = casing;
        bestCount = count;
      }
    }
    return { text: bestCasing, count: e.count, lastSeen: e.lastSeen };
  });
}

/**
 * Rank note-text suggestions for a query: prefix matches before
 * substring matches, then by frequency, then recency.
 */
export function rankSuggestions(index: FrequencyEntry[], query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase();
  const scored: { entry: FrequencyEntry; group: number }[] = [];
  for (const entry of index) {
    const pos = q === "" ? 0 : entry.text.toLowerCase().indexOf(q);
    if (pos < 0) continue;
    scored.push({ entry, group: pos === 0 ? 0 : 1 });
  }
  scored.sort(
    (a, b) =>
      a.group - b.group ||
      b.entry.count - a.entry.count ||
      b.entry.lastSeen - a.entry.lastSeen ||
      a.entry.text.localeCompare(b.entry.text)
  );
  return scored.slice(0, limit).map((s) => s.entry.text);
}

/**
 * Filter the location list for a query: prefix matches first, then
 * substring matches, keeping file order within each group. An empty
 * query returns everything.
 */
export function filterLocations(locations: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (q === "") return [...locations];
  const prefix: string[] = [];
  const substring: string[] = [];
  for (const loc of locations) {
    const pos = loc.toLowerCase().indexOf(q);
    if (pos === 0) prefix.push(loc);
    else if (pos > 0) substring.push(loc);
  }
  return [...prefix, ...substring];
}
