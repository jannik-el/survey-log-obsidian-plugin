# Tasks: Survey Log Plugin

Ordered by dependency. Each task ends with build + tests green.

## Phase 1 — Scaffold

- [x] Task 1.1: Project scaffold
  - Acceptance: `git init` done; `package.json`, strict `tsconfig.json`, `esbuild.config.mjs`, ESLint + Vitest configs exist; `manifest.json` has all required fields per docs (`id: survey-log`, `name: Survey Log`, `author`, `description`, `version` semver, `minAppVersion`, `isDesktopOnly: false`) + `versions.json` valid; `src/main.ts` loads/unloads a no-op plugin.
  - Verify: `npm run build`, `npm test` (empty suite), `npm run lint` all pass; plugin enables without error in a dev vault (symlinked as `.obsidian/plugins/survey-log/` — folder name must equal plugin id).
  - Files: package.json, tsconfig.json, esbuild.config.mjs, .eslintrc / eslint.config.mjs, vitest config, manifest.json, versions.json, src/main.ts, .gitignore

## Phase 2 — Pure logic (TDD; tasks independent)

- [x] Task 2.1: `src/time.ts`
  - Acceptance: current time in UTC/local mode; format/parse `HH:mm` + `Z` suffix; step ±n minutes with midnight wrap (`00:00` − 1 → `23:59`); invalid-input parse returns null.
  - Verify: `npm test` — tests/time.test.ts covers wrap, both modes, parse round-trip.
  - Files: src/time.ts, tests/time.test.ts

- [x] Task 2.2: `src/locations.ts`
  - Acceptance: parses file content → location list (skips blanks, `#` comments, strips `- ` bullets); sanitizes names to valid Obsidian tags (spaces → `-`, invalid chars stripped, must contain non-numeric char).
  - Verify: `npm test` — tests/locations.test.ts incl. sanitization edge cases.
  - Files: src/locations.ts, tests/locations.test.ts

- [x] Task 2.3: `src/entries.ts`
  - Acceptance: builds `- HH:mm[Z] #[prefix]Location Note` (empty note → no trailing space); regex parses entry lines tolerant of `Z`/no-`Z` and prefixes; harvests note texts from multi-line content.
  - Verify: `npm test` — tests/entries.test.ts, build↔parse round-trip.
  - Files: src/entries.ts, tests/entries.test.ts

- [x] Task 2.4: `src/suggest.ts` (pure ranking)
  - Acceptance: filter is case-insensitive prefix-then-substring; rank by frequency then recency; stable for empty query.
  - Verify: `npm test` — tests/suggest.test.ts.
  - Files: src/suggest.ts, tests/suggest.test.ts

## Phase 3 — Plugin shell

- [x] Task 3.1: Settings (`src/settings.ts`)
  - Acceptance: settings interface + defaults per SPEC table (incl. pre-fill toggle); settings tab renders all fields; persists via `loadData`/`saveData`; `lastUsedLocation` stored alongside.
  - Verify: build green; toggle settings in dev vault, reload, values persist.
  - Files: src/settings.ts, src/main.ts

- [x] Task 3.2: Command + harvest cache (`src/main.ts`)
  - Acceptance: `create-log-entry` command registered (hotkey-assignable); vault-wide note-text harvest cache built lazily per scope setting, refreshed after insert; no vault scan blocking modal open.
  - Verify: build green; command appears in palette + Hotkeys settings in dev vault.
  - Files: src/main.ts, src/entries.ts

## Phase 4 — Modal wizard

- [x] Task 4.1: Modal skeleton + time field (`src/modal.ts`)
  - Acceptance: modal opens pre-filled per timezone mode; `↑/↓` ±1 min, `Shift+↑/↓` ±10 with wrap; direct editing; invalid time blocks submit; `+`/`−` tap buttons; `Esc` cancels.
  - Verify: manual dev-vault check of all key interactions; build + tests green.
  - Files: src/modal.ts, src/main.ts

- [x] Task 4.2: Location field with autocomplete
  - Acceptance: locations file re-read on modal open (missing file → empty list, no crash); dropdown filters while typing; `↑/↓`+`Enter`/`Tab` selection; pre-filled last-used (selected text) when toggle on; unknown locations allowed (sanitized).
  - Verify: manual dev-vault check; build + tests green.
  - Files: src/modal.ts, src/suggest.ts

- [x] Task 4.3: Note field + insert
  - Acceptance: note suggestions from harvest cache (frequency-ranked), never block typing; submit builds line via entries.ts, inserts at configured position in active note; no active note → `Notice`, nothing inserted; last-used location persisted after insert.
  - Verify: manual dev-vault: full flow < 5 s keyboard-only; entry line matches spec format; tag search finds it.
  - Files: src/modal.ts, src/main.ts

## Phase 5 — Polish & release prep

- [x] Task 5.1: Edge cases + mobile pass
  - Acceptance: graceful handling of missing/renamed locations file, empty vault history, very long notes; mobile flow usable (tap buttons, on-screen keyboard).
  - Verify: manual checklist against spec Success Criteria 1–7.
  - Files: src/modal.ts, src/locations.ts (as needed)

- [x] Task 5.2: Release packaging
  - Acceptance: README (features, install, settings, demo placeholder), MIT LICENSE, author/description finalized in manifest, GitHub Actions workflow producing release with `main.js` + `manifest.json`; community submission checklist reviewed and noted in README dev section.
  - Verify: `npm run build` artifacts match release assets; checklist items all ticked or consciously waived.
  - Files: README.md, LICENSE, .github/workflows/release.yml, manifest.json
