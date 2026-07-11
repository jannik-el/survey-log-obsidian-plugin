import { describe, expect, it } from "vitest";
import { buildFrequencyIndex, filterLocations, rankSuggestions } from "../src/suggest";

describe("buildFrequencyIndex", () => {
  it("counts occurrences and tracks recency", () => {
    const index = buildFrequencyIndex(["a", "b", "a"]);
    const a = index.find((e) => e.text === "a");
    const b = index.find((e) => e.text === "b");
    expect(a).toMatchObject({ count: 2, lastSeen: 2 });
    expect(b).toMatchObject({ count: 1, lastSeen: 1 });
  });

  it("merges case-insensitively onto the most frequent casing", () => {
    const index = buildFrequencyIndex(["Water sample", "water sample", "Water sample"]);
    expect(index).toHaveLength(1);
    expect(index[0]).toMatchObject({ text: "Water sample", count: 3 });
  });
});

describe("rankSuggestions", () => {
  const index = buildFrequencyIndex([
    "Start transect",
    "Water sample taken",
    "Water sample taken",
    "Water clarity poor",
    "End transect",
    "Water sample taken",
  ]);

  it("returns most frequent first for empty query", () => {
    expect(rankSuggestions(index, "")[0]).toBe("Water sample taken");
  });

  it("matches case-insensitively", () => {
    expect(rankSuggestions(index, "water")).toEqual([
      "Water sample taken",
      "Water clarity poor",
    ]);
  });

  it("ranks prefix matches before substring matches", () => {
    // "transect" is a prefix of nothing but substring of two entries;
    // "Sta" prefixes "Start transect" only.
    expect(rankSuggestions(index, "sta")[0]).toBe("Start transect");
    const t = rankSuggestions(index, "transect");
    expect(t).toContain("Start transect");
    expect(t).toContain("End transect");
  });

  it("prefers frequency, then recency, within a group", () => {
    const idx = buildFrequencyIndex(["old note", "new note", "new note", "newer note"]);
    expect(rankSuggestions(idx, "note")).toEqual(["new note", "newer note", "old note"]);
  });

  it("applies the limit", () => {
    const idx = buildFrequencyIndex(["a1", "a2", "a3", "a4"]);
    expect(rankSuggestions(idx, "a", 2)).toHaveLength(2);
  });

  it("returns empty for no matches", () => {
    expect(rankSuggestions(index, "zzz")).toEqual([]);
  });
});

describe("filterLocations", () => {
  const locations = ["JettyNorth", "JettySouth", "Outer-Breakwater", "Pier4", "North-Pier"];

  it("returns all locations for empty query", () => {
    expect(filterLocations(locations, "")).toEqual(locations);
  });

  it("puts prefix matches before substring matches, keeping file order", () => {
    expect(filterLocations(locations, "nor")).toEqual(["North-Pier", "JettyNorth"]);
    expect(filterLocations(locations, "pier")).toEqual(["Pier4", "North-Pier"]);
  });

  it("matches case-insensitively", () => {
    expect(filterLocations(locations, "JETTY")).toEqual(["JettyNorth", "JettySouth"]);
  });

  it("returns empty for no matches", () => {
    expect(filterLocations(locations, "xyz")).toEqual([]);
  });
});
