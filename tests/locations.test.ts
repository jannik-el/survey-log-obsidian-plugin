import { describe, expect, it } from "vitest";
import {
  isValidTagName,
  parseLocationsFile,
  sanitizeLinkName,
  sanitizeTagName,
} from "../src/locations";

describe("sanitizeTagName", () => {
  it("keeps already-valid names", () => {
    expect(sanitizeTagName("JettyNorth")).toBe("JettyNorth");
    expect(sanitizeTagName("Pier_4")).toBe("Pier_4");
    expect(sanitizeTagName("loc/Pier4")).toBe("loc/Pier4");
  });

  it("converts spaces to hyphens", () => {
    expect(sanitizeTagName("Outer Breakwater")).toBe("Outer-Breakwater");
    expect(sanitizeTagName("North  Jetty   East")).toBe("North-Jetty-East");
  });

  it("keeps unicode letters", () => {
    expect(sanitizeTagName("Hanstholm Ø")).toBe("Hanstholm-Ø");
    expect(sanitizeTagName("Æbelø")).toBe("Æbelø");
  });

  it("strips invalid characters", () => {
    expect(sanitizeTagName("Pier #4!")).toBe("Pier-4");
    expect(sanitizeTagName("A (west)")).toBe("A-west");
    expect(sanitizeTagName("St. Mary's")).toBe("St-Marys");
  });

  it("tidies separator runs and edges", () => {
    expect(sanitizeTagName("  A - B  ")).toBe("A-B");
    expect(sanitizeTagName("-lead")).toBe("lead");
    expect(sanitizeTagName("trail-")).toBe("trail");
  });

  it("can return empty for garbage", () => {
    expect(sanitizeTagName("!!!")).toBe("");
    expect(sanitizeTagName("   ")).toBe("");
  });
});

describe("sanitizeLinkName", () => {
  it("keeps spaces, collapsing runs", () => {
    expect(sanitizeLinkName("Outer Breakwater")).toBe("Outer Breakwater");
    expect(sanitizeLinkName("  Outer   Breakwater  ")).toBe("Outer Breakwater");
  });

  it("strips link syntax and filename-forbidden characters", () => {
    expect(sanitizeLinkName("[[JettyNorth]]")).toBe("JettyNorth");
    expect(sanitizeLinkName("A|B#C^D")).toBe("ABCD");
    expect(sanitizeLinkName('St: "Marys" <east>?')).toBe("St Marys east");
  });

  it("keeps unicode letters", () => {
    expect(sanitizeLinkName("Hanstholm Ø")).toBe("Hanstholm Ø");
  });

  it("can return empty for garbage", () => {
    expect(sanitizeLinkName("###")).toBe("");
  });
});

describe("isValidTagName", () => {
  it("accepts names with a non-numeric character", () => {
    expect(isValidTagName("JettyNorth")).toBe(true);
    expect(isValidTagName("y1984")).toBe(true);
    expect(isValidTagName("19-84")).toBe(true);
  });

  it("rejects empty and digits-only names", () => {
    expect(isValidTagName("")).toBe(false);
    expect(isValidTagName("1984")).toBe(false);
    expect(isValidTagName("19/84")).toBe(false);
  });
});

describe("parseLocationsFile", () => {
  it("parses one location per line", () => {
    expect(parseLocationsFile("JettyNorth\nJettySouth\nPier4")).toEqual([
      "JettyNorth",
      "JettySouth",
      "Pier4",
    ]);
  });

  it("skips blank lines and # lines (comments/headings)", () => {
    const content = "# Survey locations\n\nJettyNorth\n\n# a comment\nPier4\n";
    expect(parseLocationsFile(content)).toEqual(["JettyNorth", "Pier4"]);
  });

  it("strips list bullets", () => {
    expect(parseLocationsFile("- JettyNorth\n* Pier4")).toEqual(["JettyNorth", "Pier4"]);
  });

  it("sanitizes names", () => {
    expect(parseLocationsFile("Outer Breakwater")).toEqual(["Outer-Breakwater"]);
  });

  it("drops invalid lines and case-insensitive duplicates", () => {
    const content = "JettyNorth\njettynorth\n1234\n!!!\nPier4";
    expect(parseLocationsFile(content)).toEqual(["JettyNorth", "Pier4"]);
  });

  it("handles CRLF line endings", () => {
    expect(parseLocationsFile("JettyNorth\r\nPier4\r\n")).toEqual(["JettyNorth", "Pier4"]);
  });

  it("returns empty list for empty content", () => {
    expect(parseLocationsFile("")).toEqual([]);
  });

  it("keeps spaces in link style but hyphenates in tag style", () => {
    expect(parseLocationsFile("Outer Breakwater", "link")).toEqual(["Outer Breakwater"]);
    expect(parseLocationsFile("Outer Breakwater", "tag")).toEqual(["Outer-Breakwater"]);
  });

  it("unwraps [[...]] lines in both styles", () => {
    expect(parseLocationsFile("[[Outer Breakwater]]", "link")).toEqual(["Outer Breakwater"]);
    expect(parseLocationsFile("[[Outer Breakwater]]", "tag")).toEqual(["Outer-Breakwater"]);
  });
});
