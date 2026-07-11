# Implementation Plan: Survey Log Plugin

Source of truth: [../SPEC.md](../SPEC.md). Task checklist: [todo.md](todo.md).

## Approach

Build bottom-up: pure, unit-tested logic modules first (time math, entry parsing, location handling, suggestion ranking), then the Obsidian shell around them (settings, modal, command). Each phase ends green (`npm run build` + `npm test`) and, from Phase 3 on, manually loadable in a dev vault. Community-release hygiene is built in from the scaffold, not bolted on.

## Phases & dependency order

```
P1 Scaffold ──→ P2 Pure logic ──→ P3 Plugin shell ──→ P4 Modal ──→ P5 Polish/release prep
                (parallelizable            (settings+command)
                 within phase)
```

### Phase 1 — Scaffold (foundation, everything depends on it)
Git init, `package.json`, `tsconfig.json` (strict), `esbuild.config.mjs`, ESLint, Vitest, `manifest.json` with all required fields (`id: survey-log`, `name`, `author`, `description`, `version`, `minAppVersion`, `isDesktopOnly: false`), `versions.json`, minimal `src/main.ts` that loads/unloads. Verify: builds clean, empty test run passes, plugin loads in a dev vault (symlink named `survey-log` = plugin id; Hot-Reload plugin recommended; manifest edits need an app restart).

### Phase 2 — Pure logic modules (TDD, no `obsidian` imports)
Independent of each other — any order:
- `src/time.ts` — now-in-mode, `HH:mm[Z]` format/parse, ±minute stepping with midnight wrap.
- `src/locations.ts` — parse locations-file content (skip blanks/comments, strip bullets), sanitize to valid tag names.
- `src/entries.ts` — entry-line regex (tolerant of `Z`/no-`Z`, tag prefix), build entry line, harvest note texts from file content.
- `src/suggest.ts` (pure part) — rank by frequency then recency, case-insensitive prefix+substring filter.

Risk: Obsidian tag-character rules are fiddly → encode the official rule set (alphanumeric, `-`, `_`, `/`, must contain a non-numeric char) in tests.

### Phase 3 — Plugin shell
- `src/settings.ts` — settings interface, defaults per spec table, settings tab UI, load/save via `data.json` (also holds `lastUsedLocation`).
- `src/main.ts` — register `create-log-entry` command (hotkey-assignable), wire settings, vault-wide note-text harvest cache (lazy, refreshed on load + after insert).

### Phase 4 — Modal wizard (the product)
`src/modal.ts` + suggestion dropdown wiring:
- Time field: pre-filled, `↑`/`↓` ±1 min, `Shift+↑/↓` ±10, editable, validation; `+`/`−` tap buttons for mobile.
- Location field: pre-filled last-used (selected), dropdown from locations file (re-read on open), keyboard navigation.
- Note field: suggestions from harvest cache, never blocking free input.
- Submit (`Enter` on last field / `Ctrl+Cmd+Enter` anywhere) → build line via `entries.ts`, insert at configured position in active note, persist last-used location. `Esc` cancels.

Risk: focus/keyboard-event handling inside an Obsidian `Modal` — keep each field's key handling self-contained; manual dev-vault testing is the real gate here.

### Phase 5 — Polish & release prep
Edge cases (no active note → `Notice`, missing locations file → empty list + settings hint), mobile manual pass, README with demo GIF placeholder, LICENSE (MIT), funding/author fields, GitHub Actions release workflow, run through the community submission checklist. Submission itself: user's call.

## Verification checkpoints
- After P1: `npm run build && npm test` green; plugin appears in Obsidian community-plugins list of a dev vault.
- After P2: pure-module coverage ≈ full; midnight wrap, `Z` parsing, tag sanitization all covered.
- After P4: full keyboard flow works end-to-end in dev vault (spec Success Criteria 1–7).
- After P5: checklist in spec "Success Criteria" fully satisfied; release dry-run produces valid assets.
