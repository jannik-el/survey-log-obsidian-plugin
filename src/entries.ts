/**
 * Building and parsing of survey log entry lines:
 *
 *   - 13:47Z #JettyNorth Started transect
 *   - 15:52 #loc/Pier4 Water sample taken
 *   - 16:03 #Pier4
 *   - 16:20Z [[Outer Breakwater]] End transect
 */

import type { LocationStyle } from "./locations";

export interface LogEntry {
  /** "HH:mm" as written (no Z). */
  time: string;
  /** True when the timestamp carried a "Z" (UTC) suffix. */
  utc: boolean;
  /**
   * Location without decoration: tag name without "#" but including
   * any prefix (e.g. "loc/Pier4"), or wikilink target without brackets.
   */
  location: string;
  /** How the location is written in the line. */
  style: LocationStyle;
  /** Free-text note; "" when the line has none. */
  note: string;
}

const ENTRY_RE =
  /^\s*[-*]\s+(\d{1,2}:\d{2})(Z)?\s+(?:#([\p{L}\p{N}_/-]+)|\[\[([^[\]|#^]+)\]\])(?:\s+(\S.*?))?\s*$/u;

/** Build an entry line. `location` must already be sanitized (and prefixed, for tags). */
export function buildEntryLine(entry: LogEntry): string {
  const note = entry.note.trim();
  const timestamp = `${entry.time}${entry.utc ? "Z" : ""}`;
  const location = entry.style === "tag" ? `#${entry.location}` : `[[${entry.location}]]`;
  return `- ${timestamp} ${location}${note ? ` ${note}` : ""}`;
}

/** Parse a single line; returns null when it is not an entry line. */
export function parseEntryLine(line: string): LogEntry | null {
  const match = ENTRY_RE.exec(line);
  if (!match) return null;
  const tag = match[3];
  return {
    time: match[1] as string,
    utc: match[2] === "Z",
    location: (tag ?? match[4]) as string,
    style: tag !== undefined ? "tag" : "link",
    note: match[5] ?? "",
  };
}

/**
 * Extract the note texts of all entry lines in a file, in document
 * order. Empty notes are skipped.
 */
export function harvestNoteTexts(content: string): string[] {
  const notes: string[] = [];
  for (const line of content.split(/\r?\n/)) {
    const entry = parseEntryLine(line);
    if (entry && entry.note !== "") notes.push(entry.note);
  }
  return notes;
}
