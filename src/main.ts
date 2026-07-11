import { MarkdownView, Plugin, TFile, normalizePath } from "obsidian";
import { harvestNoteTexts } from "./entries";
import { parseLocationsFile } from "./locations";
import { SurveyLogModal } from "./modal";
import { DEFAULT_SETTINGS, SurveyLogSettingTab } from "./settings";
import type { SurveyLogSettings } from "./settings";

export default class SurveyLogPlugin extends Plugin {
  settings: SurveyLogSettings = DEFAULT_SETTINGS;

  private noteTextCache: string[] | null = null;
  private cacheBuildPromise: Promise<string[]> | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new SurveyLogSettingTab(this.app, this));

    this.addCommand({
      id: "create-log-entry",
      name: "Create log entry",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        if (!checking) new SurveyLogModal(this, view).open();
        return true;
      },
    });

    // Warm the vault-wide note-text cache once the workspace is ready,
    // so the first modal open has suggestions without a blocking scan.
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.suggestionScope === "vault") void this.collectNoteTexts(null);
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /**
   * Locations from the configured locations file, sanitized.
   * Returns null when the file does not exist (so the modal can hint).
   * Re-read on every call — the file is small and must never be stale.
   */
  async readLocations(): Promise<string[] | null> {
    const file = this.locationsTFile();
    if (!file) return null;
    return parseLocationsFile(await this.app.vault.cachedRead(file), this.settings.locationStyle);
  }

  private locationsPath(): string {
    return normalizePath(this.settings.locationsFile || DEFAULT_SETTINGS.locationsFile);
  }

  private locationsTFile(): TFile | null {
    const file = this.app.vault.getAbstractFileByPath(this.locationsPath());
    return file instanceof TFile ? file : null;
  }

  /**
   * Append a location to the locations file if it is not already
   * listed (case-insensitive, after per-style sanitization). Creates
   * the file when missing. Returns true when the location was added.
   */
  async addLocationIfNew(location: string): Promise<boolean> {
    if (!this.settings.autoAddLocations) return false;
    const file = this.locationsTFile();
    if (!file) {
      try {
        await this.app.vault.create(this.locationsPath(), `${location}\n`);
        return true;
      } catch {
        // Path taken by a folder or in a missing parent folder — leave it be.
        return false;
      }
    }
    const existing = parseLocationsFile(
      await this.app.vault.cachedRead(file),
      this.settings.locationStyle
    );
    if (existing.some((name) => name.toLowerCase() === location.toLowerCase())) return false;
    await this.app.vault.process(file, (content) =>
      content === "" || content.endsWith("\n")
        ? `${content}${location}\n`
        : `${content}\n${location}\n`
    );
    return true;
  }

  /**
   * Previously used note texts for autocomplete, per the configured
   * scope. Vault scope is cached in memory; note scope reads only the
   * given file and is cheap enough to do per modal open.
   */
  async collectNoteTexts(activeFile: TFile | null): Promise<string[]> {
    if (this.settings.suggestionScope === "note") {
      if (!activeFile) return [];
      return harvestNoteTexts(await this.app.vault.cachedRead(activeFile));
    }
    if (this.noteTextCache) return this.noteTextCache;
    this.cacheBuildPromise ??= this.buildVaultNoteTextCache();
    return this.cacheBuildPromise;
  }

  private async buildVaultNoteTextCache(): Promise<string[]> {
    const texts: string[] = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      try {
        texts.push(...harvestNoteTexts(await this.app.vault.cachedRead(file)));
      } catch {
        // Unreadable file — skip it rather than losing all suggestions.
      }
    }
    this.noteTextCache = texts;
    this.cacheBuildPromise = null;
    return texts;
  }

  invalidateNoteTextCache(): void {
    this.noteTextCache = null;
    this.cacheBuildPromise = null;
  }

  /** Insert a finished entry line into the view per the insert-position setting. */
  insertEntryLine(view: MarkdownView, line: string): void {
    const editor = view.editor;
    if (this.settings.insertPosition === "cursor") {
      const cursor = editor.getCursor();
      const currentLine = editor.getLine(cursor.line);
      if (currentLine.trim() === "") {
        editor.setLine(cursor.line, line);
        editor.setCursor({ line: cursor.line, ch: line.length });
      } else {
        editor.replaceRange(`\n${line}`, { line: cursor.line, ch: currentLine.length });
        editor.setCursor({ line: cursor.line + 1, ch: line.length });
      }
      return;
    }
    const lastLine = editor.lastLine();
    const lastText = editor.getLine(lastLine);
    if (lastText.trim() === "") {
      editor.setLine(lastLine, line);
      editor.setCursor({ line: lastLine, ch: line.length });
    } else {
      editor.replaceRange(`\n${line}`, { line: lastLine, ch: lastText.length });
      editor.setCursor({ line: lastLine + 1, ch: line.length });
    }
  }

  /**
   * Called by the modal after a successful insert. Returns true when
   * the location was newly added to the locations file.
   */
  async afterInsert(location: string, note: string): Promise<boolean> {
    this.settings.lastUsedLocation = location;
    await this.saveSettings();
    if (note && this.noteTextCache) this.noteTextCache.push(note);
    return this.addLocationIfNew(location);
  }
}
