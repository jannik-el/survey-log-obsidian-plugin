# Spec: Survey Log — Obsidian Plugin

## Objective

An Obsidian plugin for fast event logging while out on survey tasks — timestamped, location-tagged entries created in seconds via a keyboard shortcut on desktop or by tapping on mobile.

**User story:** As a surveyor in the field, I press one hotkey, get a pre-filled timestamp I can nudge with arrow keys, pick a location from an autocompleting list, optionally type a note (with suggestions from my own past entries), press Enter — and a clean, tagged log line lands in my active note. Afterwards, I can find every entry for a location via Obsidian's normal tag search.

**Success looks like:** creating a complete entry takes < 5 seconds and zero mouse usage.

### Core flow

1. User presses hotkey (assignable in Obsidian's Hotkeys settings) → **single modal wizard** opens.
2. **Time field** — pre-filled with the current time, `HH:mm`, in UTC or local depending on plugin setting.
   - `↑`/`↓` adjusts by ±1 minute; `Shift+↑`/`Shift+↓` by ±10 minutes.
   - Direct typing/overwriting also allowed; invalid input blocks submission.
3. **Location field** — pre-filled with the **last-used location** (fully selected, so typing instantly replaces it and plain `Enter` reuses it — fast when logging repeatedly at one station). Autocomplete against the location list (see below): fuzzy/prefix matching while typing; `↑`/`↓` navigates suggestions, `Enter`/`Tab` accepts and moves on. Last-used location persists across restarts (plugin `data.json`).
4. **Note field** — free text, with autocomplete suggestions drawn from note texts of **previous log entries in the vault** (learned automatically, ranked by usage frequency). Suggestions are optional to accept; typing anything is fine. May be left empty.
5. `Enter` on the final field (or `Cmd/Ctrl+Enter` from anywhere in the modal) inserts the entry into the **active note**. `Esc` cancels without inserting.

### Entry format

```markdown
- 13:47Z #JettyNorth Started transect      (location style: tag, default)
- 15:52 #loc/Pier4 Water sample taken      (tag with prefix)
- 16:20Z [[Outer Breakwater]] End transect (location style: wikilink)
```

- `- HH:mm[Z] <location> Note text`, where `<location>` is `#[prefix]Location` (tag style) or `[[Location]]` (wikilink style), per the **Location style** setting.
- `Z` suffix appears **only** when the timestamp was taken in UTC mode, so lines are self-describing.
- Tag style: entries per location findable via tag pane / search / Dataview. Wikilink style: each location is a linkable node — backlinks pane lists all entries, location notes can hold metadata; link text permits spaces so sanitization is lighter. Tag prefix setting applies to tag style only.
- Note text may be empty → line ends after the location.

### Locations list

- Lives in a **dedicated markdown note** in the vault; path configured in plugin settings (default: `locations.md`).
- One location per line; blank lines and `#` comment lines ignored. A leading `- ` (list bullet) is tolerated and stripped.
- Locations must produce valid Obsidian tag names: the plugin sanitizes on insert (spaces → `-`, strips characters invalid in tags) and shows the sanitized form in the suggestion list.
- Optional **tag prefix** setting (e.g. `loc/`) → inserted tags become `#loc/JettyNorth`. Default: empty. Not applied in wikilink style.
- File is re-read when the modal opens (no stale cache after edits).
- **Auto-add:** when an entry is inserted with a location not yet in the list, the location is appended to the locations file (created if missing), with a confirmation Notice. Toggleable in settings, on by default.

### Settings

| Setting | Type | Default |
|---|---|---|
| Timezone mode | `UTC` \| `Local` | `UTC` |
| Locations file path | text (path suggestion) | `locations.md` |
| Location style | `Tag (#Location)` \| `Wikilink ([[Location]])` | `Tag` |
| Tag prefix | text | `` (empty) |
| Auto-add new locations | toggle | `on` |
| Insert position | `End of note` \| `At cursor` | `End of note` |
| Note-suggestion scope | `Whole vault` \| `Current note only` | `Whole vault` |
| Pre-fill last-used location | toggle | `on` |

### Note-text suggestion engine

- Parses lines matching the entry format (regex on `- HH:mm(Z)? #tag …`) to harvest past note texts.
- Ranked by frequency, then recency; case-insensitive prefix + substring matching while typing.
- Vault-wide scan is cached in memory and refreshed lazily (on plugin load and after each insert); must not block the modal from opening.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **API:** Obsidian Plugin API (latest stable `obsidian` typings)
- **Bundler:** esbuild (as in the official `obsidian-sample-plugin` template)
- **Tests:** Vitest for pure logic (time math/formatting, entry parsing, location sanitization, suggestion ranking). Obsidian API surface kept thin and untested-by-unit-tests; verified manually in a dev vault.
- **Runtime deps:** none beyond `obsidian`. Native `Date`/`Intl` for time handling — no moment/dayjs.
- **Mobile:** supported (`isDesktopOnly: false`); arrow-key affordances degrade gracefully — modal also gets small `+`/`−` tap buttons next to the time field.
- **Distribution:** targeting an eventual **community plugin release** — follow the official plugin guidelines and submission checklist from day one (manifest completeness, README, LICENSE, `versions.json`, GitHub release with `main.js`/`manifest.json`/`styles.css` assets, no console noise, sentence-case UI text).

## Commands

```bash
npm run dev     # esbuild watch mode, builds main.js into the repo root
npm run build   # tsc --noEmit type check + esbuild production bundle
npm test        # vitest run
npm run lint    # eslint src/ --ext .ts
```

Manual testing: symlink/copy the repo into `<dev-vault>/.obsidian/plugins/survey-log/` — the folder name **must equal the plugin `id`** (`survey-log`), not the repo name. Use a dedicated dev vault (per official docs, never a real vault) with the **Hot-Reload** plugin installed so `npm run dev` rebuilds reload automatically. Note: `manifest.json` changes require a full Obsidian restart; source changes only need a plugin reload.

## Project Structure

```
manifest.json        → Obsidian plugin manifest (id: survey-log)
versions.json        → Obsidian version compatibility map
esbuild.config.mjs   → build script
src/main.ts          → plugin entry: command registration, settings load
src/settings.ts      → settings tab + defaults
src/modal.ts         → the entry-creation modal wizard (time/location/note fields)
src/time.ts          → pure: now-in-mode, HH:mm format/parse, ±minute stepping
src/locations.ts     → pure-ish: parse locations file content, sanitize tag names
src/entries.ts       → pure: entry-line regex, build entry line, harvest note texts
src/suggest.ts       → suggestion ranking/filtering (pure) + modal field wiring
tests/*.test.ts      → vitest unit tests mirroring src modules
SPEC.md              → this document
```

## Code Style

```ts
/** Format a Date as HH:mm in the given mode; appends "Z" when utc. */
export function formatEntryTime(date: Date, mode: TimezoneMode): string {
  const h = mode === "utc" ? date.getUTCHours() : date.getHours();
  const m = mode === "utc" ? date.getUTCMinutes() : date.getMinutes();
  const base = `${pad2(h)}:${pad2(m)}`;
  return mode === "utc" ? `${base}Z` : base;
}
```

- Pure logic lives in dependency-free modules (no `obsidian` import) so it's unit-testable.
- Named exports, no default exports. `camelCase` functions, `PascalCase` types/classes.
- Prettier defaults; ESLint with `@typescript-eslint` recommended rules.

## Testing Strategy

- **Unit (Vitest):** `time.ts`, `entries.ts`, `locations.ts`, `suggest.ts` — target ~full coverage of these pure modules. Key cases: midnight rollover when stepping minutes (`00:00` − 1 → `23:59`), UTC vs local formatting, parsing tolerant of `Z`/no-`Z` and prefixed tags, tag sanitization edge cases, empty note text.
- **Manual (dev vault):** modal keyboard flow end-to-end, mobile tap flow, hotkey registration, settings persistence, locations file re-read.
- Tests live in `tests/`, run headless via `npm test` — no Obsidian instance required.

## Boundaries

- **Always:** run `npm run build` + `npm test` before considering a task done; keep pure logic free of `obsidian` imports; follow Obsidian plugin review guidelines (no `innerHTML` with user data, use `Vault` API not `fs`).
- **Ask first:** adding any npm runtime dependency; changing the entry line format; expanding scope (e.g. GPS capture, CSV export); actually submitting to the community plugin registry (prepare for it, but submission is the user's call).
- **Never:** write to vault files other than the active note and the configured locations file (append/create for auto-add only); make network requests; store data outside the vault + plugin data.json.

## Success Criteria

1. Hotkey opens the modal in < 200 ms with the current time pre-filled per the timezone setting.
2. `↑`/`↓` on the time field steps ±1 min (Shift: ±10), correctly wrapping across midnight.
3. Typing in the location field filters the list from the configured locations file; unknown locations can still be typed and are inserted (sanitized) as tags.
4. Note field suggests previously used note texts, most-frequent first; suggestions never block free typing.
5. Enter inserts `- HH:mm[Z] #Location Note` into the active note at the configured position; Esc inserts nothing.
6. Tag search for `#JettyNorth` (or `#loc/JettyNorth` with prefix) lists every entry for that location.
7. Full flow is operable without a mouse on desktop and via touch on mobile.
8. `npm run build` and `npm test` pass clean.

## Resolved Decisions

- **Last-used location is pre-filled** in the modal (toggleable in settings, on by default), persisted in `data.json`. *(2026-07-11)*
- **Community release is intended** — build to the submission checklist from the start. *(2026-07-11)*
- **Location style is configurable** — tag (default) or wikilink, per user review of navigability trade-offs. *(2026-07-11)*
- **New locations are auto-added** to the locations file on insert (toggleable). Boundary widened accordingly: the plugin may append to/create the locations file. *(2026-07-11)*

## Open Questions

1. Entry insertion at "End of note" — v1 assumes literally the last line (not section-aware). Revisit if it bites.
2. No **date** in the entry line — v1 assumes the containing note (e.g. daily note) provides date context.
