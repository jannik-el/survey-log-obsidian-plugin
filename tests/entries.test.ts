import { describe, expect, it } from "vitest";
import { buildEntryLine, harvestNoteTexts, parseEntryLine } from "../src/entries";
import type { LogEntry } from "../src/entries";

describe("buildEntryLine", () => {
  it("builds a UTC tag entry with note", () => {
    expect(
      buildEntryLine({
        time: "13:47",
        utc: true,
        location: "JettyNorth",
        style: "tag",
        note: "Started transect",
      })
    ).toBe("- 13:47Z #JettyNorth Started transect");
  });

  it("builds a local tag entry without Z", () => {
    expect(
      buildEntryLine({
        time: "15:52",
        utc: false,
        location: "loc/Pier4",
        style: "tag",
        note: "Water sample taken",
      })
    ).toBe("- 15:52 #loc/Pier4 Water sample taken");
  });

  it("builds a wikilink entry", () => {
    expect(
      buildEntryLine({
        time: "16:20",
        utc: true,
        location: "Outer Breakwater",
        style: "link",
        note: "End transect",
      })
    ).toBe("- 16:20Z [[Outer Breakwater]] End transect");
  });

  it("omits trailing space for empty note", () => {
    expect(
      buildEntryLine({ time: "16:03", utc: false, location: "Pier4", style: "tag", note: "" })
    ).toBe("- 16:03 #Pier4");
    expect(
      buildEntryLine({ time: "16:03", utc: false, location: "Pier4", style: "link", note: "   " })
    ).toBe("- 16:03 [[Pier4]]");
  });
});

describe("parseEntryLine", () => {
  it("parses a UTC tag entry", () => {
    expect(parseEntryLine("- 13:47Z #JettyNorth Started transect")).toEqual({
      time: "13:47",
      utc: true,
      location: "JettyNorth",
      style: "tag",
      note: "Started transect",
    });
  });

  it("parses a local entry with prefixed tag", () => {
    expect(parseEntryLine("- 15:52 #loc/Pier4 Water sample taken")).toEqual({
      time: "15:52",
      utc: false,
      location: "loc/Pier4",
      style: "tag",
      note: "Water sample taken",
    });
  });

  it("parses a wikilink entry, spaces allowed", () => {
    expect(parseEntryLine("- 16:20Z [[Outer Breakwater]] End transect")).toEqual({
      time: "16:20",
      utc: true,
      location: "Outer Breakwater",
      style: "link",
      note: "End transect",
    });
  });

  it("parses entries without note", () => {
    expect(parseEntryLine("- 16:03 #Pier4")).toMatchObject({ location: "Pier4", note: "" });
    expect(parseEntryLine("- 16:03 [[Pier4]]")).toMatchObject({ location: "Pier4", note: "" });
  });

  it("tolerates indentation, * bullets and trailing whitespace", () => {
    expect(parseEntryLine("  - 13:47Z #A note  ")).toEqual({
      time: "13:47",
      utc: true,
      location: "A",
      style: "tag",
      note: "note",
    });
    expect(parseEntryLine("* 13:47 #A note")).not.toBeNull();
  });

  it("keeps inner whitespace of the note intact", () => {
    expect(parseEntryLine("- 13:47 #A depth 3.5 m, visibility poor")?.note).toBe(
      "depth 3.5 m, visibility poor"
    );
  });

  it("rejects non-entry lines", () => {
    expect(parseEntryLine("Some ordinary text")).toBeNull();
    expect(parseEntryLine("- a bullet without time")).toBeNull();
    expect(parseEntryLine("- 13:47 no tag here")).toBeNull();
    expect(parseEntryLine("13:47 #A missing bullet")).toBeNull();
    expect(parseEntryLine("- 13:47 [[]] empty link")).toBeNull();
    expect(parseEntryLine("- 25:99 #A invalid time is still matched?")).not.toBeNull(); // regex is lenient; validity is the builder's job
  });

  it("round-trips with buildEntryLine in both styles", () => {
    const tagEntry: LogEntry = {
      time: "07:05",
      utc: true,
      location: "loc/Outer-Breakwater",
      style: "tag",
      note: "End transect",
    };
    expect(parseEntryLine(buildEntryLine(tagEntry))).toEqual(tagEntry);
    const linkEntry: LogEntry = {
      time: "07:05",
      utc: false,
      location: "Outer Breakwater",
      style: "link",
      note: "End transect",
    };
    expect(parseEntryLine(buildEntryLine(linkEntry))).toEqual(linkEntry);
  });
});

describe("harvestNoteTexts", () => {
  it("collects note texts in document order, skipping empty notes", () => {
    const content = [
      "# Survey 2026-07-11",
      "",
      "- 13:47Z #JettyNorth Started transect",
      "- 13:52Z #JettyNorth Water sample taken",
      "- 14:01Z #Pier4",
      "Some prose in between.",
      "- 14:10Z [[Outer Breakwater]] Water sample taken",
    ].join("\n");
    expect(harvestNoteTexts(content)).toEqual([
      "Started transect",
      "Water sample taken",
      "Water sample taken",
    ]);
  });

  it("returns empty for content without entries", () => {
    expect(harvestNoteTexts("just some text\n- a list item")).toEqual([]);
  });
});
