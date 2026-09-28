import { describe, it, expect } from "vitest";
import { createDisplayId, formatBytes, formatTimestamp } from "./format";

describe("createDisplayId", () => {
  it("produces PD- prefix and 6 uppercase hex characters", () => {
    expect(createDisplayId("7ac291aa-bbbb-cccc-dddd-eeeeeeeeeeee")).toBe(
      "PD-7AC291"
    );
  });

  it("handles UUIDs with all lowercase characters", () => {
    const result = createDisplayId("a101cf00-0000-0000-0000-000000000000");
    expect(result).toBe("PD-A101CF");
  });
});

describe("formatBytes", () => {
  it("formats bytes under 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes with one decimal", () => {
    expect(formatBytes(1536 * 1024)).toBe("1.5 MB");
  });

  it("handles zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("handles negative or invalid", () => {
    expect(formatBytes(-1)).toBe("Unknown size");
    expect(formatBytes(NaN)).toBe("Unknown size");
  });
});

describe("formatTimestamp", () => {
  it("returns a non-empty string for a valid ISO timestamp", () => {
    const result = formatTimestamp("2026-09-28T19:52:14.000Z");
    expect(result).toBeTruthy();
    expect(result).not.toBe("Invalid date");
  });

  it("returns Invalid date for garbage input", () => {
    expect(formatTimestamp("not-a-date")).toBe("Invalid date");
  });

  it("returns Unknown time for empty string", () => {
    expect(formatTimestamp("")).toBe("Unknown time");
  });
});
