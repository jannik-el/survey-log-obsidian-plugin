import { Modal, Notice } from "obsidian";
import { buildLocationsFileContent } from "./locations";
import type SurveyLogPlugin from "./main";

/**
 * First-run dialog shown when the "Create log entry" command is invoked
 * but the configured locations file does not exist yet. Explains the
 * locations file, lets the user optionally seed it with initial
 * locations, creates it, then hands off to the log-entry modal.
 *
 * "Skip" continues to the log-entry modal without creating the file
 * (auto-add still creates it on the first insert).
 */
export class LocationsSetupModal extends Modal {
  private linesInput!: HTMLTextAreaElement;

  constructor(
    private plugin: SurveyLogPlugin,
    private onContinue: () => void
  ) {
    super(plugin.app);
  }

  onOpen(): void {
    const { contentEl } = this;
    const path = this.plugin.locationsFilePath;
    contentEl.addClass("survey-log-modal");
    this.setTitle("Set up Survey Log");

    const intro = contentEl.createDiv({ cls: "survey-log-setup-intro" });
    intro.createEl("p", {
      text:
        "Survey Log tags each entry with a location, and keeps the list of " +
        "your locations in a single note so autocomplete can suggest them.",
    });
    const notFound = intro.createEl("p");
    notFound.appendText("That note (");
    notFound.createEl("code", { text: path });
    notFound.appendText(") doesn't exist yet. Add some locations to start with, or leave it blank.");

    const row = contentEl.createDiv({ cls: "survey-log-row" });
    row.createEl("label", { text: "Locations (one per line)", cls: "survey-log-label" });
    this.linesInput = row.createEl("textarea", {
      cls: "survey-log-setup-textarea",
      attr: {
        rows: "6",
        spellcheck: "false",
        placeholder: "Jetty North\nPier 4\nOuter Breakwater",
        "aria-label": "Initial locations, one per line",
      },
    });

    // Ctrl/Cmd+Enter creates and continues; plain Enter stays a newline
    // in the textarea.
    this.linesInput.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" && (evt.ctrlKey || evt.metaKey)) {
        evt.preventDefault();
        void this.createAndContinue();
      }
    });

    const footer = contentEl.createDiv({ cls: "survey-log-footer" });
    const hint = footer.createDiv({ cls: "survey-log-hint" });
    hint.setText("Ctrl+Enter create");
    const buttons = footer.createDiv({ cls: "survey-log-setup-buttons" });
    const skipBtn = buttons.createEl("button", { text: "Skip" });
    skipBtn.addEventListener("click", () => {
      this.close();
      this.onContinue();
    });
    const createBtn = buttons.createEl("button", { text: "Create & log", cls: "mod-cta" });
    createBtn.addEventListener("click", () => void this.createAndContinue());

    this.linesInput.focus();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private async createAndContinue(): Promise<void> {
    const content = buildLocationsFileContent(this.linesInput.value.split("\n"));
    const created = await this.plugin.createLocationsFile(content);
    if (created) {
      new Notice(`Created ${this.plugin.settings.locationsFile}`);
    } else {
      new Notice(`Could not create ${this.plugin.settings.locationsFile} — check the path in settings.`);
    }
    this.close();
    this.onContinue();
  }
}
