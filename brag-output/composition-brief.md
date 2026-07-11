# Hyperframes Composition Brief: Survey Log

## Objective
Create a short launch-style brag video for Survey Log, an Obsidian plugin for fast timestamped field logging.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: ~21 seconds (15–25 hard bounds)

## Source Material
- Project root: /home/jannik/repos/survey-log-obsidian-plugin
- Primary files read: README.md, src/modal.ts, styles.css, images/modal.png (real screenshot), manifest.json
- Product name: Survey Log
- Tagline / strongest claim: one hotkey → timestamped, location-tagged log entry in ~3 keystrokes
- Key UI or visual moment to recreate: the "New log entry" modal (Time (UTC) row with −/+ steppers, Location field with suggestion dropdown, Note field with suggestion, purple "Insert entry" button) and the resulting note line
- Copy that must appear verbatim:
  - `Survey notes get messy.` + `Too slow to log? You don't log.` (hook)
  - `New log entry` (modal title), `Time (UTC)` / `Location` / `Note` (field labels)
  - `- 11:52Z #JettyNorth Water sample taken` (the payoff entry line)
  - `#JettyNorth` search query + result rows from three different survey notes (see storyboard)
  - `Every entry. Every survey. One search.` (search caption)
  - `Fast to write. Structured to find.` (thesis)
  - `Survey Log` + `field logging for Obsidian` + `github.com/jannik-el/survey-log-obsidian-plugin` (lockup)

## Creative Direction
- Tone preset: polished
- Creative direction: quiet, precise field-instrument film — the confidence of a tool that respects the clock
- Interpretation: restrained motion, longer holds, soft transitions; the typing simulation carries the energy
- Angle: survey notes get messy; too slow means you don't log at all; Survey Log is fast to write AND structured to find (the after-the-fact location search is the payoff)
- Hook: drifting messy note fragments + "Survey notes get messy." then "Too slow to log? You don't log."
- Outro / punchline: search payoff, thesis line "Fast to write. Structured to find.", then the Survey Log lockup with purple glow and music fade
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Redesigning the UI — match the real plugin modal (see images/modal.png)

## Visual Identity
- Background: #1e1e1e; panels #262626; borders #3f3f46
- Text: #dcddde primary; #999999 muted
- Accent: #a882ff (tag pills, button, glow)
- Display font: Inter 600/700 (fallback: system-ui)
- Body font: Inter; ALL timestamps/log lines in JetBrains Mono (fallback: ui-monospace)
- Visual references from the project: images/modal.png (the real modal, dark theme, purple accents)

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The mess — 4s — drifting messy note fragments; two hook lines read fully
2. The answer — 3s — "Survey Log — fast enough to actually use." + faithful modal recreation slides up
3. The flow — 7s — typed `jet` → dropdown → Enter → `wat` → suggestion → Enter → entry line lands with glowing #JettyNorth pill
4. Find it later — 4s — `#JettyNorth` search fills with rows from three different survey notes; caption "Every entry. Every survey. One search."
5. Lockup — 3s — thesis "Fast to write. Structured to find." then Survey Log lockup, music fade

## Audio
- Audio role: warm confident bed under a precise UI demo
- Audio arc: low entry → steady under demo (ducked during typing) → three claim accents → 1.5s fade under logo
- Music: happy-beats-business-moves-vol-1-by-ende-dot-app.mp3 (bundled, 120.19 BPM)
- Music treatment: start 0s low-mid; slight duck during typing; fade out last 1.5s
- Music cue guidance: preset at `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json` (copied beside track). Strong cues 16.02 / 17.02 / 18.02 / 18.52 / 20.02 / 21.01s → use for search-row arrivals and the lockup. Beat grid ~0.5s spacing for non-text accents only; search rows are readable text → every other beat at most.
- Audio-reactive treatment: subtle; RMS may breathe the purple glow behind modal/logo. No waveform/equalizer visuals, no text pulsing.
- Audio-coupled moments:
  - Scene 1 — clock second-ticks (soft)
  - Scene 3 — keyboard ticks per typed char; click per Enter-accept; warm confirm when the entry line lands
  - Scene 4 — search typing ticks; result rows arriving near strong cues
  - Scene 5 — beat-locked lockup; final fade
- SFX selection guidance: use `sfx-analysis.md` from the brag skill assets; prefer low high-frequency-risk files for the repeated keyboard ticks; keep everything quiet relative to the bed
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, volume from the implemented animation.
- Audio files: copy chosen music + SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Use the current `hyperframes` skill and CLI workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show the recreated modal, the entry line, and the tag-search payoff (real UI copy) — non-negotiable.
- Keep all text readable: each hook line ≥1.6s settled; payoff entry line ≥1.4s; search rows arrive no faster than every other beat and all stay on; thesis ≥1.5s.
- Keep the video within 15–25 seconds (~21s target).
- Include music + SFX layer as above.
- Beat-lock 1–3 major reveals (claims/lockup) within ±0.15s of strong cues; do not snap readable text to every 0.5s beat.
- Use local assets only.
- Run Hyperframes lint and validate (check) before render.
