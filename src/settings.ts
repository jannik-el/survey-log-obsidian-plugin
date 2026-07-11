import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import type { LocationStyle } from "./locations";
import type { TimezoneMode } from "./time";
import type SurveyLogPlugin from "./main";

export type InsertPosition = "end" | "cursor";
export type SuggestionScope = "vault" | "note";

export interface SurveyLogSettings {
  timezoneMode: TimezoneMode;
  locationsFile: string;
  locationStyle: LocationStyle;
  tagPrefix: string;
  autoAddLocations: boolean;
  insertPosition: InsertPosition;
  suggestionScope: SuggestionScope;
  prefillLastLocation: boolean;
  /** Persisted state, not user-facing: last location used in the modal. */
  lastUsedLocation: string;
}

export const DEFAULT_SETTINGS: SurveyLogSettings = {
  timezoneMode: "utc",
  locationsFile: "locations.md",
  locationStyle: "tag",
  tagPrefix: "",
  autoAddLocations: true,
  insertPosition: "end",
  suggestionScope: "vault",
  prefillLastLocation: true,
  lastUsedLocation: "",
};

export class SurveyLogSettingTab extends PluginSettingTab {
  plugin: SurveyLogPlugin;

  constructor(app: App, plugin: SurveyLogPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Timezone")
      .setDesc("Timestamps in UTC get a \"Z\" suffix (e.g. 13:47Z) so entries are self-describing.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("utc", "UTC")
          .addOption("local", "Local time")
          .setValue(this.plugin.settings.timezoneMode)
          .onChange(async (value) => {
            this.plugin.settings.timezoneMode = value as TimezoneMode;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Locations file")
      .setDesc("Vault path of the note listing your locations, one per line.")
      .addText((text) =>
        text
          .setPlaceholder("locations.md")
          .setValue(this.plugin.settings.locationsFile)
          .onChange(async (value) => {
            this.plugin.settings.locationsFile = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Location style")
      .setDesc(
        "Tags (#JettyNorth) are findable via the tag pane and search. " +
          "Wikilinks ([[JettyNorth]]) make each location a note with a backlinks list of all its entries."
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOption("tag", "Tag (#Location)")
          .addOption("link", "Wikilink ([[Location]])")
          .setValue(this.plugin.settings.locationStyle)
          .onChange(async (value) => {
            this.plugin.settings.locationStyle = value as LocationStyle;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Auto-add new locations")
      .setDesc("When an entry uses a location not yet in the locations file, append it there.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.autoAddLocations).onChange(async (value) => {
          this.plugin.settings.autoAddLocations = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Tag prefix")
      .setDesc("Optional prefix for location tags, e.g. \"loc/\" turns Pier4 into #loc/Pier4.")
      .addText((text) =>
        text
          .setPlaceholder("loc/")
          .setValue(this.plugin.settings.tagPrefix)
          .onChange(async (value) => {
            this.plugin.settings.tagPrefix = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Insert position")
      .setDesc("Where a new entry is inserted in the active note.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("end", "End of note")
          .addOption("cursor", "At cursor")
          .setValue(this.plugin.settings.insertPosition)
          .onChange(async (value) => {
            this.plugin.settings.insertPosition = value as InsertPosition;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Note suggestions from")
      .setDesc("Where previously used note texts are collected from.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("vault", "Whole vault")
          .addOption("note", "Current note only")
          .setValue(this.plugin.settings.suggestionScope)
          .onChange(async (value) => {
            this.plugin.settings.suggestionScope = value as SuggestionScope;
            await this.plugin.saveSettings();
            this.plugin.invalidateNoteTextCache();
          })
      );

    new Setting(containerEl)
      .setName("Pre-fill last-used location")
      .setDesc("Open the modal with the previous location pre-selected, so Enter reuses it.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.prefillLastLocation).onChange(async (value) => {
          this.plugin.settings.prefillLastLocation = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
