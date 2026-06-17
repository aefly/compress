import { describe, it, expect } from "vitest";
import { createZip } from "../zip";

describe("createZip", () => {
  it("creates a zip blob from files", async () => {
    const files = [
      {
        name: "test1.jpg",
        blob: new Blob(["content1"], { type: "image/jpeg" }),
      },
      {
        name: "test2.png",
        blob: new Blob(["content2"], { type: "image/png" }),
      },
    ];

    const result = await createZip(files);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe("application/zip");
    expect(result.size).toBeGreaterThan(0);
  });

  it("creates a zip with a single file", async () => {
    const files = [
      {
        name: "single.jpg",
        blob: new Blob(["data"], { type: "image/jpeg" }),
      },
    ];

    const result = await createZip(files);
    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBeGreaterThan(0);
  });

  it("handles empty file list", async () => {
    const result = await createZip([]);
    expect(result).toBeInstanceOf(Blob);
  });

  it("throws on invalid input", async () => {
    await expect(createZip(null as unknown as [])).rejects.toThrow();
  });
});