/**
 * Parsing of the locations file and sanitization of location names,
 * either into valid Obsidian tag names or into wikilink-safe names.
 *
 * Obsidian tag rules: letters (any language), digits, underscore,
 * hyphen and forward slash (nested tags); a tag must contain at
 * least one non-numerical character.
 *
 * Wikilink names permit spaces but must avoid link syntax characters
 * ([ ] | # ^) and characters Obsidian forbids in file names.
 */

export type LocationStyle = "tag" | "link";

/** Characters allowed in an Obsidian tag name. */
const INVALID_TAG_CHARS = /[^\p{L}\p{N}_/-]/gu;

/** Link syntax + forbidden-in-filename characters. */
const INVALID_LINK_CHARS = /[[\]|#^*"\\/<>:?]/g;

/**
 * Sanitize a raw location name into a tag-safe string:
 * whitespace runs become "-", invalid characters are dropped,
 * repeated/edge separators are tidied. May return "".
 */
export function sanitizeTagName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, "-")
    .replace(INVALID_TAG_CHARS, "")
    .replace(/-{2,}/g, "-")
    .replace(/^[-/]+/, "")
    .replace(/[-/]+$/, "");
}

/**
 * Sanitize a raw location name for use inside [[...]]: spaces are
 * kept (runs collapsed), link-breaking characters are dropped.
 * May return "".
 */
export function sanitizeLinkName(raw: string): string {
  return raw.replace(INVALID_LINK_CHARS, "").replace(/\s+/g, " ").trim();
}

/** A tag is valid if non-empty and not made up of digits/slashes only. */
export function isValidTagName(tag: string): boolean {
  return tag.length > 0 && /[^\p{N}/]/u.test(tag);
}

/** Sanitize a location name per style. */
export function sanitizeLocation(raw: string, style: LocationStyle): string {
  return style === "tag" ? sanitizeTagName(raw) : sanitizeLinkName(raw);
}

/** Whether a sanitized location name is usable in the given style. */
export function isValidLocation(name: string, style: LocationStyle): boolean {
  return style === "tag" ? isValidTagName(name) : name.length > 0;
}

/**
 * Build the initial contents of a freshly created locations file from
 * user-entered lines: a heading (so the note reads well in Obsidian),
 * then each non-blank line, trimmed. Blank lines are dropped. Names are
 * written verbatim — parseLocationsFile sanitizes them on read.
 */
export function buildLocationsFileContent(rawLines: string[]): string {
  const names = rawLines.map((line) => line.trim()).filter((line) => line !== "");
  return names.length > 0 ? `# Locations\n\n${names.join("\n")}\n` : "# Locations\n";
}

/**
 * Parse the contents of the locations note into a list of location
 * names sanitized for the given style. One location per line; blank
 * lines and lines starting with "#" (comments/headings) are ignored;
 * a leading list bullet ("- " or "* ") and wikilink brackets are
 * tolerated. Duplicates (case-insensitive, after sanitization) are
 * dropped, keeping first occurrence.
 */
export function parseLocationsFile(content: string, style: LocationStyle = "tag"): string[] {
  const seen = new Set<string>();
  const locations: string[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    if (line.startsWith("- ") || line.startsWith("* ")) line = line.slice(2).trim();
    const linkMatch = /^\[\[(.+)\]\]$/.exec(line);
    if (linkMatch) line = (linkMatch[1] as string).trim();
    const name = sanitizeLocation(line, style);
    if (!isValidLocation(name, style)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    locations.push(name);
  }
  return locations;
}
