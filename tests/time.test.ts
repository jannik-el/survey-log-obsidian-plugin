import { describe, expect, it } from "vitest";
import {
  formatMinutes,
  formatTimestamp,
  minutesOfDay,
  parseTimeText,
  stepMinutes,
} from "../src/time";

describe("minutesOfDay", () => {
  // 2026-07-11T13:47:22Z
  const date = new Date(Date.UTC(2026, 6, 11, 13, 47, 22));

  it("reads UTC hours/minutes in utc mode", () => {
    expect(minutesOfDay(date, "utc")).toBe(13 * 60 + 47);
  });

  it("reads local hours/minutes in local mode", () => {
    expect(minutesOfDay(date, "local")).toBe(date.getHours() * 60 + date.getMinutes());
  });

  it("ignores seconds", () => {
    const withSeconds = new Date(Date.UTC(2026, 6, 11, 13, 47, 59));
    expect(minutesOfDay(withSeconds, "utc")).toBe(13 * 60 + 47);
  });
});

describe("formatMinutes", () => {
  it("zero-pads hours and minutes", () => {
    expect(formatMinutes(0)).toBe("00:00");
    expect(formatMinutes(9 * 60 + 5)).toBe("09:05");
    expect(formatMinutes(23 * 60 + 59)).toBe("23:59");
  });

  it("wraps out-of-range values", () => {
    expect(formatMinutes(24 * 60)).toBe("00:00");
    expect(formatMinutes(-1)).toBe("23:59");
  });
});

describe("parseTimeText", () => {
  it("parses HH:mm and H:mm", () => {
    expect(parseTimeText("13:47")).toBe(13 * 60 + 47);
    expect(parseTimeText("9:05")).toBe(9 * 60 + 5);
    expect(parseTimeText("00:00")).toBe(0);
    expect(parseTimeText("23:59")).toBe(23 * 60 + 59);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseTimeText(" 13:47 ")).toBe(13 * 60 + 47);
  });

  it("rejects invalid times", () => {
    expect(parseTimeText("24:00")).toBeNull();
    expect(parseTimeText("12:60")).toBeNull();
    expect(parseTimeText("12:7")).toBeNull();
    expect(parseTimeText("1247")).toBeNull();
    expect(parseTimeText("")).toBeNull();
    expect(parseTimeText("ab:cd")).toBeNull();
    expect(parseTimeText("13:47Z")).toBeNull();
  });
});

describe("stepMinutes", () => {
  it("steps forward and backward", () => {
    expect(stepMinutes(13 * 60 + 47, 1)).toBe(13 * 60 + 48);
    expect(stepMinutes(13 * 60 + 47, -1)).toBe(13 * 60 + 46);
    expect(stepMinutes(13 * 60 + 47, 10)).toBe(13 * 60 + 57);
  });

  it("wraps across midnight in both directions", () => {
    expect(stepMinutes(0, -1)).toBe(23 * 60 + 59);
    expect(stepMinutes(23 * 60 + 59, 1)).toBe(0);
    expect(stepMinutes(5, -10)).toBe(23 * 60 + 55);
    expect(stepMinutes(23 * 60 + 55, 10)).toBe(5);
  });
});

describe("formatTimestamp", () => {
  it("appends Z only in utc mode", () => {
    expect(formatTimestamp(13 * 60 + 47, "utc")).toBe("13:47Z");
    expect(formatTimestamp(13 * 60 + 47, "local")).toBe("13:47");
  });
});
