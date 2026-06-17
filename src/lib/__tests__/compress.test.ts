import { describe, it, expect, vi, beforeEach } from "vitest";
import { compressImage } from "../compress";
import { MIN_COMPRESS_SIZE } from "../constants";

function createMockFile(
  name: string,
  type: string,
  size: number = 1024
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

function createMockCanvas() {
  const blob = new Blob(["compressed"], { type: "image/jpeg" });
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({
      drawImage: vi.fn(),
    })),
    toBlob: vi.fn((cb: (blob: Blob | null) => void) => cb(blob)),
  };
}

describe("compressImage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws for unsupported format", async () => {
    const file = createMockFile("test.txt", "text/plain");
    await expect(
      compressImage(file, { quality: 80 })
    ).rejects.toThrow("Unsupported format: text/plain");
  });

  it("throws for removed format (tiff)", async () => {
    const file = createMockFile("test.tiff", "image/tiff", 2048);
    await expect(
      compressImage(file, { quality: 80 })
    ).rejects.toThrow("Unsupported format: image/tiff");
  });

  it("skips compression for files smaller than MIN_COMPRESS_SIZE", async () => {
    const file = createMockFile("tiny.jpg", "image/jpeg", 5000);
    const onProgress = vi.fn();
    const result = await compressImage(file, { quality: 80, onProgress });
    expect(result.blob).toBe(file);
    expect(onProgress).toHaveBeenCalledWith(10);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("uses MIN_COMPRESS_SIZE constant for the threshold", () => {
    expect(MIN_COMPRESS_SIZE).toBe(10 * 1024);
  });

  it("compresses a jpeg image via canvas", async () => {
    const mockCanvas = createMockCanvas();
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement
    );

    vi.spyOn(global, "Image").mockImplementation(function () {
      const img = {
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: "",
        naturalWidth: 800,
        naturalHeight: 600,
      };
      setTimeout(() => img.onload?.(), 0);
      return img as unknown as HTMLImageElement;
    });

    vi.spyOn(global.FileReader.prototype, "readAsDataURL").mockImplementation(
      function (this: FileReader) {
        setTimeout(() => {
          Object.defineProperty(this, "result", {
            value: "data:image/jpeg;base64,abc",
          });
          this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
        }, 0);
      }
    );

    const file = createMockFile("test.jpg", "image/jpeg");
    const onProgress = vi.fn();
    const result = await compressImage(file, { quality: 80, onProgress });

    expect(result.blob).toBeInstanceOf(Blob);
    expect(onProgress).toHaveBeenCalled();
  });

  it("normalizes quality from 0-100 to 0-1", async () => {
    const mockCanvas = createMockCanvas();
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement
    );

    vi.spyOn(global, "Image").mockImplementation(function () {
      const img = {
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: "",
        naturalWidth: 800,
        naturalHeight: 600,
      };
      setTimeout(() => img.onload?.(), 0);
      return img as unknown as HTMLImageElement;
    });

    vi.spyOn(global.FileReader.prototype, "readAsDataURL").mockImplementation(
      function (this: FileReader) {
        setTimeout(() => {
          Object.defineProperty(this, "result", {
            value: "data:image/jpeg;base64,abc",
          });
          this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
        }, 0);
      }
    );

    const file = createMockFile("test.jpg", "image/jpeg", 50000);
    await compressImage(file, { quality: 50 });

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.5
    );
  });
});