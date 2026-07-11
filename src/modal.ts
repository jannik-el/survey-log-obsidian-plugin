import { MarkdownView, Modal, Notice } from "obsidian";
import { buildEntryLine } from "./entries";
import { isValidLocation, sanitizeLocation, sanitizeTagName } from "./locations";
import { buildFrequencyIndex, filterLocations, rankSuggestions } from "./suggest";
import type { FrequencyEntry } from "./suggest";
import { formatMinutes, minutesOfDay, parseTimeText, stepMinutes } from "./time";
import type SurveyLogPlugin from "./main";

const SUGGESTION_LIMIT = 6;

/**
 * A minimal inline suggestion list rendered below an input. Fully
 * controlled by the modal so Enter behavior stays predictable:
 * items are only "accepted by Enter" when explicitly highlighted.
 */
class SuggestBox {
  private el: HTMLElement;
  private items: string[] = [];
  private selected = -1;

  constructor(parent: HTMLElement, private onPick: (value: string) => void) {
    this.el = parent.createDiv({ cls: "survey-log-suggest" });
    this.el.hide();
  }

  /** Show items; highlightFirst pre-selects the first item (location field). */
  show(items: string[], highlightFirst: boolean): void {
    this.items = items;
    this.selected = items.length > 0 && highlightFirst ? 0 : -1;
    this.render();
  }

  hide(): void {
    this.items = [];
    this.selected = -1;
    this.el.empty();
    this.el.hide();
  }

  get isOpen(): boolean {
    return this.items.length > 0;
  }

  /** Currently highlighted item, if any. */
  current(): string | null {
    return this.selected >= 0 ? (this.items[this.selected] ?? null) : null;
  }

  /** Highlighted item, or the first item when nothing is highlighted. */
  currentOrFirst(): string | null {
    if (this.items.length === 0) return null;
    return this.items[this.selected >= 0 ? this.selected : 0] ?? null;
  }

  /** Move the highlight by delta, clamping into the list. */
  move(delta: number): void {
    if (this.items.length === 0) return;
    const next = this.selected + delta;
    this.selected = Math.max(0, Math.min(this.items.length - 1, next));
    this.render();
  }

  private render(): void {
    this.el.empty();
    if (this.items.length === 0) {
      this.el.hide();
      return;
    }
    this.el.show();
    this.items.forEach((item, i) => {
      const itemEl = this.el.createDiv({
        cls: `suggestion-item${i === this.selected ? " is-selected" : ""}`,
        text: item,
      });
      // pointerdown (not click) so the pick happens before the input blurs.
      itemEl.addEventListener("pointerdown", (evt) => {
        evt.preventDefault();
        this.onPick(item);
      });
    });
  }
}

export class SurveyLogModal extends Modal {
  private timeInput!: HTMLInputElement;
  private locationInput!: HTMLInputElement;
  private noteInput!: HTMLInputElement;
  private locationSuggest!: SuggestBox;
  private noteSuggest!: SuggestBox;

  private locations: string[] = [];
  private locationsFileMissing = false;
  private noteIndex: FrequencyEntry[] = [];

  constructor(
    private plugin: SurveyLogPlugin,
    private view: MarkdownView
  ) {
    super(plugin.app);
  }

  onOpen(): void {
    const { contentEl } = this;
    const settings = this.plugin.settings;
    contentEl.addClass("survey-log-modal");
    this.setTitle("New log entry");

    // Ctrl/Cmd+Enter submits from anywhere in the modal. Field handlers
    // let this combination bubble up (without preventDefault) so it
    // always lands here exactly once.
    contentEl.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" && (evt.ctrlKey || evt.metaKey) && !evt.defaultPrevented) {
        evt.preventDefault();
        this.submit();
      }
    });

    // --- Time field -------------------------------------------------
    const timeRow = contentEl.createDiv({ cls: "survey-log-row" });
    timeRow.createEl("label", {
      text: `Time (${settings.timezoneMode === "utc" ? "UTC" : "local"})`,
      cls: "survey-log-label",
    });
    const timeControls = timeRow.createDiv({ cls: "survey-log-time-controls" });
    const minusBtn = timeControls.createEl("button", { text: "−", cls: "survey-log-step-btn" });
    this.timeInput = timeControls.createEl("input", {
      type: "text",
      cls: "survey-log-time-input",
      attr: { spellcheck: "false", "aria-label": "Entry time (HH:mm)" },
    });
    const plusBtn = timeControls.createEl("button", { text: "+", cls: "survey-log-step-btn" });
    this.timeInput.value = formatMinutes(minutesOfDay(new Date(), settings.timezoneMode));

    minusBtn.addEventListener("click", () => this.stepTime(-1));
    plusBtn.addEventListener("click", () => this.stepTime(1));
    this.timeInput.addEventListener("keydown", (evt) => {
      if (evt.key === "ArrowUp" || evt.key === "ArrowDown") {
        evt.preventDefault();
        this.stepTime((evt.key === "ArrowUp" ? 1 : -1) * (evt.shiftKey ? 10 : 1));
      } else if (evt.key === "Enter" && !evt.ctrlKey && !evt.metaKey) {
        evt.preventDefault();
        this.locationInput.focus();
      }
    });

    // --- Location field ----------------------------------------------
    const locationRow = contentEl.createDiv({ cls: "survey-log-row" });
    locationRow.createEl("label", { text: "Location", cls: "survey-log-label" });
    this.locationInput = locationRow.createEl("input", {
      type: "text",
      cls: "survey-log-wide-input",
      attr: { spellcheck: "false", placeholder: "Location…", "aria-label": "Location" },
    });
    this.locationSuggest = new SuggestBox(locationRow, (value) => {
      this.locationInput.value = value;
      this.locationSuggest.hide();
      this.noteInput.focus();
    });

    this.locationInput.addEventListener("input", () => this.updateLocationSuggestions());
    this.locationInput.addEventListener("focus", () => {
      // Select-all so the pre-filled (last-used) location is reused by
      // a plain Enter but instantly replaced when typing starts.
      this.locationInput.select();
      this.updateLocationSuggestions();
    });
    this.locationInput.addEventListener("blur", () => {
      // Delay so a pointerdown pick on a suggestion lands first.
      window.setTimeout(() => this.locationSuggest.hide(), 100);
    });
    this.locationInput.addEventListener("keydown", (evt) => {
      if (evt.key === "ArrowDown" || evt.key === "ArrowUp") {
        evt.preventDefault();
        this.locationSuggest.move(evt.key === "ArrowDown" ? 1 : -1);
      } else if (evt.key === "Enter" || evt.key === "Tab") {
        const picked = this.locationSuggest.current();
        if (picked) this.locationInput.value = picked;
        this.locationSuggest.hide();
        if (evt.key === "Enter" && (evt.ctrlKey || evt.metaKey)) {
          return; // bubbles to the Ctrl+Enter catch-all → submit
        }
        if (evt.key === "Enter" || !evt.shiftKey) {
          evt.preventDefault();
          this.noteInput.focus();
        }
      } else if (evt.key === "Escape" && this.locationSuggest.isOpen) {
        evt.stopPropagation();
        this.locationSuggest.hide();
      }
    });

    if (settings.prefillLastLocation && settings.lastUsedLocation) {
      this.locationInput.value = settings.lastUsedLocation;
    }

    // --- Note field ---------------------------------------------------
    const noteRow = contentEl.createDiv({ cls: "survey-log-row" });
    noteRow.createEl("label", { text: "Note", cls: "survey-log-label" });
    this.noteInput = noteRow.createEl("input", {
      type: "text",
      cls: "survey-log-wide-input",
      attr: { placeholder: "Optional note…", "aria-label": "Note" },
    });
    this.noteSuggest = new SuggestBox(noteRow, (value) => {
      this.noteInput.value = value;
      this.noteSuggest.hide();
      this.noteInput.focus();
    });

    this.noteInput.addEventListener("input", () => this.updateNoteSuggestions());
    this.noteInput.addEventListener("blur", () => {
      window.setTimeout(() => this.noteSuggest.hide(), 100);
    });
    this.noteInput.addEventListener("keydown", (evt) => {
      if (evt.key === "ArrowDown" || evt.key === "ArrowUp") {
        evt.preventDefault();
        this.noteSuggest.move(evt.key === "ArrowDown" ? 1 : -1);
      } else if (evt.key === "Tab" && !evt.ctrlKey && !evt.metaKey) {
        // Tab accepts the suggestion (highlighted, else first) when the
        // dropdown is open; otherwise let focus move on normally.
        const picked = this.noteSuggest.currentOrFirst();
        if (picked !== null) {
          evt.preventDefault();
          this.noteInput.value = picked;
          this.noteSuggest.hide();
        }
      } else if (evt.key === "Enter") {
        if (evt.ctrlKey || evt.metaKey) {
          return; // bubbles to the Ctrl+Enter catch-all → submit
        }
        evt.preventDefault();
        // Enter accepts the open suggestion (highlighted, else first),
        // so a second Enter then submits; with no suggestion it submits.
        const picked = this.noteSuggest.currentOrFirst();
        if (picked !== null) {
          this.noteInput.value = picked;
          this.noteSuggest.hide();
        } else {
          this.submit();
        }
      } else if (evt.key === "Escape" && this.noteSuggest.isOpen) {
        evt.stopPropagation();
        this.noteSuggest.hide();
      }
    });

    // --- Footer ---------------------------------------------------------
    const footer = contentEl.createDiv({ cls: "survey-log-footer" });
    const hint = footer.createDiv({ cls: "survey-log-hint" });
    hint.setText("↑↓ adjust · Enter next · Ctrl+Enter insert");
    const submitBtn = footer.createEl("button", { text: "Insert entry", cls: "mod-cta" });
    submitBtn.addEventListener("click", () => this.submit());

    // --- Async data ------------------------------------------------------
    void this.plugin.readLocations().then((locations) => {
      this.locationsFileMissing = locations === null;
      this.locations = locations ?? [];
      if (this.locationsFileMissing) {
        hint.setText(
          `Locations file "${this.plugin.settings.locationsFile}" not found — check plugin settings.`
        );
        hint.addClass("survey-log-hint-warning");
      }
    });
    void this.plugin.collectNoteTexts(this.view.file).then((texts) => {
      this.noteIndex = buildFrequencyIndex(texts);
    });

    // Focus the time field with content selected: Enter accepts as-is,
    // typing replaces, arrows adjust.
    this.timeInput.focus();
    this.timeInput.select();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private stepTime(delta: number): void {
    const current =
      parseTimeText(this.timeInput.value) ??
      minutesOfDay(new Date(), this.plugin.settings.timezoneMode);
    this.timeInput.value = formatMinutes(stepMinutes(current, delta));
  }

  private updateLocationSuggestions(): void {
    const matches = filterLocations(this.locations, this.locationInput.value).slice(
      0,
      SUGGESTION_LIMIT
    );
    this.locationSuggest.show(matches, true);
  }

  private updateNoteSuggestions(): void {
    const query = this.noteInput.value;
    if (query.trim() === "") {
      this.noteSuggest.hide();
      return;
    }
    this.noteSuggest.show(rankSuggestions(this.noteIndex, query, SUGGESTION_LIMIT), false);
  }

  private submit(): void {
    const settings = this.plugin.settings;

    const minutes = parseTimeText(this.timeInput.value);
    if (minutes === null) {
      new Notice("Invalid time — use HH:mm.");
      this.timeInput.focus();
      this.timeInput.select();
      return;
    }

    const style = settings.locationStyle;
    const location = sanitizeLocation(this.locationInput.value, style);
    // The tag prefix only applies to tag style; links use the name as-is.
    const decorated =
      style === "tag" ? sanitizeTagName(`${settings.tagPrefix}${this.locationInput.value}`) : location;
    if (!isValidLocation(decorated, style)) {
      new Notice("Location is required.");
      this.locationInput.focus();
      return;
    }

    const note = this.noteInput.value.trim();
    const line = buildEntryLine({
      time: formatMinutes(minutes),
      utc: settings.timezoneMode === "utc",
      location: decorated,
      style,
      note,
    });

    this.plugin.insertEntryLine(this.view, line);
    void this.plugin.afterInsert(location, note).then((added) => {
      if (added) new Notice(`Added "${location}" to ${settings.locationsFile}`);
    });
    this.close();
  }
}
