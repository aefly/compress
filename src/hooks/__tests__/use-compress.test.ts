import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCompress } from "../use-compress";

function createMockFile(
  name: string = "test.jpg",
  type: string = "image/jpeg",
  size: number = 1024
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

vi.mock("@/lib/compress", () => ({
  compressImage: vi.fn().mockResolvedValue({
    blob: new Blob(["compressed"], { type: "image/jpeg" }),
    width: 800,
    height: 600,
  }),
}));

vi.mock("@/lib/zip", () => ({
  createZip: vi.fn().mockResolvedValue(new Blob(["zip"], { type: "application/zip" })),
}));

vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

describe("useCompress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useCompress());
    expect(result.current.files).toEqual([]);
    expect(result.current.quality).toBe(80);
    expect(result.current.isCompressing).toBe(false);
    expect(result.current.errors).toEqual([]);
    expect(result.current.doneCount).toBe(0);
    expect(result.current.totalReduction).toBe(0);
  });

  it("adds valid files", () => {
    const { result } = renderHook(() => useCompress());
    const file = createMockFile();

    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].name).toBe("test.jpg");
    expect(result.current.files[0].status).toBe("pending");
  });

  it("rejects files exceeding size limit", () => {
    const { result } = renderHook(() => useCompress());
    const largeFile = createMockFile("large.jpg", "image/jpeg", 60 * 1024 * 1024);

    act(() => {
      result.current.addFiles([largeFile]);
    });

    expect(result.current.files).toHaveLength(0);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toContain("50 MB");
  });

  it("rejects unsupported format files", () => {
    const { result } = renderHook(() => useCompress());
    const textFile = createMockFile("readme.txt", "text/plain");

    act(() => {
      result.current.addFiles([textFile]);
    });

    expect(result.current.files).toHaveLength(0);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toContain("not a supported");
  });

  it("removes a file by id", () => {
    const { result } = renderHook(() => useCompress());
    const file = createMockFile();

    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.files).toHaveLength(1);
    const fileId = result.current.files[0].id;

    act(() => {
      result.current.removeFile(fileId);
    });

    expect(result.current.files).toHaveLength(0);
  });

  it("clears all files", () => {
    const { result } = renderHook(() => useCompress());

    act(() => {
      result.current.addFiles([createMockFile("a.jpg"), createMockFile("b.jpg")]);
    });

    expect(result.current.files).toHaveLength(2);

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toHaveLength(0);
  });

  it("dismisses an error", () => {
    const { result } = renderHook(() => useCompress());
    const textFile = createMockFile("readme.txt", "text/plain");

    act(() => {
      result.current.addFiles([textFile]);
    });

    expect(result.current.errors).toHaveLength(1);
    const errorId = result.current.errors[0].id;

    act(() => {
      result.current.dismissError(errorId);
    });

    expect(result.current.errors).toHaveLength(0);
  });

  it("updates quality", () => {
    const { result } = renderHook(() => useCompress());

    act(() => {
      result.current.setQuality(50);
    });

    expect(result.current.quality).toBe(50);
  });

  it("limits to MAX_FILES and shows error for dropped files", () => {
    const { result } = renderHook(() => useCompress());
    const files = Array.from({ length: 12 }, (_, i) =>
      createMockFile(`img${i}.jpg`)
    );

    act(() => {
      result.current.addFiles(files);
    });

    expect(result.current.files).toHaveLength(10);
    const hasMaxError = result.current.errors.some(
      (e) => e.message.includes("more file") || e.message.includes("not added")
    );
    expect(hasMaxError).toBe(true);
  });

  it("resets a file to pending state", () => {
    const { result } = renderHook(() => useCompress());
    const file = createMockFile();

    act(() => {
      result.current.addFiles([file]);
    });

    const fileId = result.current.files[0].id;

    act(() => {
      result.current.resetFile(fileId);
    });

    const updated = result.current.files[0];
    expect(updated.status).toBe("pending");
    expect(updated.compressedSize).toBeUndefined();
    expect(updated.compressedBlob).toBeUndefined();
  });
});