# Changelog

All notable changes to Survey Log are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Add user-facing notes for your change under **[Unreleased]** as you work — say
what changed and *why* it matters. On release, that section is stamped with the
new version and becomes the GitHub release notes shown in Obsidian's update view.

## [Unreleased]

## [0.1.7] - 2026-07-12

### Added

- **First-run setup dialog.** When you run **Create log entry** and no locations
  file exists yet, a guided dialog now opens to create it — with an optional box
  to seed your first locations — before the log modal appears. Previously new
  users only saw a red "locations file not found" warning and had to figure the
  file out on their own. This also sidesteps the common pitfall of creating
  the note manually in Obsidian and ending up with `locations.md.md`, which the
  plugin never finds.

### Changed

- Reframed the plugin around **event logging** and made clear it works both via
  a keyboard shortcut and on mobile (rather than describing it as keyboard-only).

## [0.1.6] - 2026-07-11

### Changed

- Hardened per community review: `loadData()` is now typed (no unsafe
  assignment), release assets ship with build-provenance attestations, and the
  vault-wide scan's scope is documented.

## [0.1.5] - 2026-07-11

### Changed

- Note suggestions now accept on **Tab** or **Enter** (the highlighted item, or
  the first when none is highlighted), matching the location field's behavior.

## [0.1.4] - 2026-07-11

### Documentation

- README: added version, downloads, Obsidian, build, and license badges.

## [0.1.3] - 2026-07-11

### Documentation

- README: embedded an auto-playing GIF demo and linked the MP4 via the GitHub
  video player.

## [0.1.2] - 2026-07-11

### Documentation

- README: added a demo video.

## [0.1.1] - 2026-07-11

### Documentation

- README: added a screenshot of the entry modal.

## [0.1.0] - 2026-07-11

### Added

- Initial release. A fast, keyboard-shortcut and mobile-friendly modal for
  timestamped survey event logging: current-time prefill with `↑`/`↓` (±1 min)
  and `Shift`+`↑`/`↓` (±10 min) nudging (or `+`/`−` buttons on mobile); location
  field with autocomplete from a configurable
  locations file; note field with autocomplete learned from past entries;
  tag (`#Location`) or wikilink (`[[Location]]`) styles; UTC/local timestamps;
  auto-add of new locations; and a settings tab for all of the above.
- Auto-release CI: version bump and GitHub release on each push to `main`.

[Unreleased]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.7...HEAD
[0.1.7]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.6...0.1.7
[0.1.6]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.5...0.1.6
[0.1.5]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.4...0.1.5
[0.1.4]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/jannik-el/survey-log-obsidian-plugin/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/jannik-el/survey-log-obsidian-plugin/releases/tag/0.1.0
