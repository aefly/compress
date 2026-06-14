import { describe, it, expect } from "vitest";
import { cn, formatSize, truncateName } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatSize(1000)).toBe("1.0 KB");
    expect(formatSize(1500)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatSize(1000000)).toBe("1.00 MB");
    expect(formatSize(5000000)).toBe("5.00 MB");
  });

  it("handles zero", () => {
    expect(formatSize(0)).toBe("0 B");
  });

  it("handles exact boundaries", () => {
    expect(formatSize(999)).toBe("999 B");
    expect(formatSize(1000)).toBe("1.0 KB");
  });
});

describe("truncateName", () => {
  it("returns short names unchanged", () => {
    expect(truncateName("test.jpg")).toBe("test.jpg");
  });

  it("returns names at exactly 30 chars unchanged", () => {
    const name = "a".repeat(30);
    expect(truncateName(name)).toBe(name);
  });

  it("truncates names longer than 30 chars", () => {
    const name = "a".repeat(31);
    expect(truncateName(name)).toBe("a".repeat(30) + "...");
  });

  it("uses custom max length", () => {
    expect(truncateName("abcdefgh", 5)).toBe("abcde...");
  });

  it("handles empty string", () => {
    expect(truncateName("")).toBe("");
  });
});
