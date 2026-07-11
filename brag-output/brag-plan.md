# Brag Plan: Survey Log

## What is this app?
An Obsidian plugin that makes field logging fast enough to actually happen — one hotkey, ~3 keystrokes, and every entry is timestamped and location-tagged so it's findable months later.

## The angle
Problem-first, in the user's own words: **survey notes get messy, and if you can't take them fast, you don't take them at all.** But raw speed alone gives you an unsearchable pile — you also need structure. Survey Log's pitch is the pairing: *fast to write, structured to find*. The video walks that exact arc: the mess → the 3-keystroke entry → the after-the-fact search that pulls up every entry for a location across all your notes.

## Hook (first 2-4 seconds)
Dark screen. Scattered, half-readable note fragments drift at angles ("12:40?? jetty", "sample taken??", "which pier was that"). Over them, the line lands: **"Survey notes get messy."** Then a harder second line: **"Too slow to log? You don't log."**

## Key moments (the middle)
- The New log entry modal springs open, UTC time pre-filled `11:52` — zero thinking.
- `jet` typed → dropdown filters to JettyNorth/JettySouth → Enter. `wat` typed → "Water sample taken" suggested from past entries → Enter.
- The entry lands in the note: `- 11:52Z #JettyNorth Water sample taken`, tag pill glowing purple.
- **The structure payoff:** a search for `#JettyNorth` fills with entries from *different* survey notes (2026-06-30, 2026-07-11, 2026-07-12) — months of work at one location, one query.

## Outro / punchline
**Fast to write. Structured to find.** Then the lockup: **Survey Log** — *field logging for Obsidian* — `github.com/jannik-el/survey-log-obsidian-plugin`.

## User flow worth showing
Entry → key action → result → **retrieval**:
1. Hotkey opens the modal, current UTC time pre-filled.
2. Location autocomplete + note suggestion, keyboard-only.
3. Tagged entry line lands in the active note.
4. Later: search the location tag → every entry, every survey, one list.

## Tone
- Preset: polished
- Creative direction: quiet, precise field-instrument film — messy problem, calm confident answer
- Interpretation: the hook is allowed one beat of visual chaos; everything after is restrained, longer holds, soft transitions; the typing demo and the filling search list carry the energy

## Format: landscape — 1920x1080
## Duration: ~21 seconds

## Visual identity (from the project)
- Background: #1e1e1e (Obsidian dark), panels #262626, borders #3f3f46
- Accent: #a882ff (Obsidian purple — tag pills, CTA button, glow)
- Text: #dcddde primary, #999 muted
- Display font: Inter (600/700)
- Body font: Inter; timestamps and log lines in JetBrains Mono
- Strongest visual elements: the New log entry modal (time stepper, suggestion dropdown), the tagged entry line, and a tag-search results panel

## Share copy (draft)
Survey notes get messy — and if logging is slow, you just don't log. Survey Log for Obsidian: one hotkey, three keystrokes, and every entry is UTC-stamped and location-tagged so you can pull up every survey at that location months later.

## Audio direction
- Role: warm confident bed under a precise UI demo
- Music: happy-beats-business-moves-vol-1 (120 BPM bundled track)
- Music treatment: start at 0 low; hold back during the messy hook, open up when the modal appears; duck slightly under typing; fade out over the last 1.5s under the logo
- Music cue guidance: preset cues read (120.19 BPM). Strong cues at 16.02s / 17.02s / 18.02s / 18.52s / 20.02s / 21.01s — target the search-result arrivals and the final lockup near these. Beat grid (~0.5s spacing) may drive non-text accents only; search-result rows are readable text → every other beat at most.
- Audio-reactive treatment: subtle; music RMS may breathe the purple glow behind modal/logo. No waveforms, no pulsing text.
- SFX posture: moderate, motion-matched — soft keyboard ticks during typed text, quiet click per suggestion accept, one warm confirm when the entry lands, soft ticks as search results arrive
- Audio-coupled moments: hook lines; the two autocomplete accepts; the entry-line landing; search rows arriving; lockup
- Restraint rule: no sound without on-screen motion; keyboard ticks low; nothing masks the payoff line or the search list

## Storyboard

### Scene 1 — The mess — 4s
Dark background. 4-5 messy note fragments drift in at slight angles, low contrast, slightly blurred ("12:40?? jetty", "sample taken??", "which pier??", "15:10 or 15:01"). Line 1 lands over them: "Survey notes get messy." (hold ≥1.6s). Fragments dim; line 2 lands harder: "Too slow to log? You don't log." (hold ≥1.6s).
Sequential/interaction: fragments drift in loosely one after another (non-text accents may ride beats)
Audio intent: bed enters low and slightly tense-held; a muffled paper/UI rustle as fragments arrive
Audio-coupled idea: fragment arrivals as soft ticks
Music: bed starts 0s, restrained
Transition mood: clean (the mess wipes away) → Scene 2

### Scene 2 — The answer — 3s
Background clears to clean Obsidian dark. Title line: "Survey Log — fast enough to actually use." The recreated New log entry modal slides up: Time (UTC) row with − / 11:52 / +, empty Location and Note fields, purple Insert entry button. Purple glow breathes behind it.
Sequential/interaction: modal entrance
Audio intent: music opens up; one soft UI pop as the modal lands
Audio-coupled idea: modal-landing pop
Music: bed lifts
Transition mood: clean → Scene 3

### Scene 3 — The flow — 7s
Inside the modal, simulated keyboard-only use:
(a) `jet` types into Location (~0.9s); dropdown filters to JettyNorth / JettySouth; Enter accepts first (hold 0.7s).
(b) `wat` types into Note; suggestion "Water sample taken" appears; Enter accepts (hold 0.7s).
(c) Modal dips away; note view: the entry line writes itself in mono — `- 11:52Z #JettyNorth Water sample taken` — the `#JettyNorth` pill fills purple and glows once. Hold ≥1.4s.
Sequential/interaction: yes — typed chars, dropdown filter, two Enter-accepts, line landing
Audio intent: quiet keyboard ticks; click per accept; warm confirm on landing
Audio-coupled idea: typing ticks; accept clicks; landing confirm
Music: steady, slightly ducked during typing
Transition mood: clean → Scene 4

### Scene 4 — Find it later — 4s
A search panel slides in, query typing: `#JettyNorth`. Three result rows arrive one by one (~every other beat, each holds), each showing source note + entry line:
- `Survey 2026-06-30` — `- 09:14Z #JettyNorth Start transect`
- `Survey 2026-07-11` — `- 08:14Z #JettyNorth Water sample taken`
- `Survey 2026-07-12` — `- 11:52Z #JettyNorth Water sample taken`
Caption beneath: "Every entry. Every survey. One search." (hold ≥1.4s, stays into the transition)
Sequential/interaction: yes — query types, three result rows arrive one by one (beat-synced to every other beat)
Audio intent: soft tick per row; the list filling should feel like the payoff
Audio-coupled idea: search typing ticks; row arrivals near strong cues (16.02 / 17.02 / 18.02s)
Music: full presence
Transition mood: soft → Scene 5

### Scene 5 — Lockup — 3s
Thesis line lands: "Fast to write. Structured to find." (hold ≥1.5s). Then the lockup rises: **Survey Log**, subline "field logging for Obsidian", URL small beneath; purple glow breathes as music fades out.
Sequential/interaction: thesis line, then lockup (lockup near strong cue ~20.02s)
Audio intent: one soft impact for the thesis; music fades under logo
Audio-coupled idea: beat-locked lockup; final fade
Music: fades out over last 1.5s
Transition mood: soft hold → end

**Music mood for this video:** upbeat but warm, professional
**Audio summary:** a restrained bed opens up when the answer appears — ticks and clicks match every typed character and arriving row, the search payoff rides the strongest cues, and the bed fades clean under the logo.
