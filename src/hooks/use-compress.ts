"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { compressImage } from "@/lib/compress";
import { createZip } from "@/lib/zip";
import {
  CompressFile,
  MAX_FILES,
  MAX_FILE_SIZE,
  DEFAULT_QUALITY,
  SUPPORTED_FORMATS,
} from "@/lib/constants";
import { saveAs } from "file-saver";
import { truncateName } from "@/lib/utils";

// Module-level counter ensures unique IDs even when multiple files are added in the same millisecond.
// Not in React state because it does not need to trigger re-renders.
let nextId = 0;
function generateId(): string {
  return `file-${nextId++}-${Date.now()}`;
}

export interface FileError {
  id: string;
  message: string;
}

export function useCompress() {
  const [files, setFiles] = useState<CompressFile[]>([]);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState<FileError[]>([]);
  // Every Object URL created must be revoked to avoid memory leaks.
  // Tracked in a ref (not state) so revocation never causes re-renders.
  const urlsRef = useRef<Set<string>>(new Set());

  function trackUrl(url: string) {
    urlsRef.current.add(url);
  }

  function revokeTrackedUrl(url: string) {
    URL.revokeObjectURL(url);
    urlsRef.current.delete(url);
  }

  // Cleanup all object URLs when the hook unmounts
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const remaining = MAX_FILES - files.length;
      const toAdd = newFiles.slice(0, remaining);
      const newErrors: FileError[] = [];

      // Validate files: check size limit and format support
      const valid = toAdd.filter((f) => {
        if (f.size > MAX_FILE_SIZE) {
          newErrors.push({
            id: generateId(),
            message: `"${truncateName(f.name)}" exceeds 50 MB limit (${(f.size / (1000 * 1000)).toFixed(1)} MB)`,
          });
          return false;
        }
        if (
          !SUPPORTED_FORMATS.includes(
            f.type as (typeof SUPPORTED_FORMATS)[number]
          )
        ) {
          newErrors.push({
            id: generateId(),
            message: `"${truncateName(f.name)}" is not a supported image format`,
          });
          return false;
        }
        return true;
      });

      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      // Create preview URLs and file entries
      const compressFiles: CompressFile[] = valid.map((file) => {
        const url = URL.createObjectURL(file);
        trackUrl(url);
        return {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: url,
          status: "pending",
          progress: 0,
        };
      });

      setFiles((prev) => [...prev, ...compressFiles]);
    },
    [files.length]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        revokeTrackedUrl(file.previewUrl);
        if (file.compressedUrl) revokeTrackedUrl(file.compressedUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        revokeTrackedUrl(f.previewUrl);
        if (f.compressedUrl) revokeTrackedUrl(f.compressedUrl);
      });
      return [];
    });
  }, []);

  const updateFile = useCallback(
    (id: string, updates: Partial<CompressFile>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const compressAll = useCallback(async () => {
    setIsCompressing(true);

    // Reset any previously compressed files back to pending
    const filesToCompress = files.filter(
      (f) =>
        f.status === "pending" ||
        f.status === "error" ||
        f.status === "done"
    );

    for (const file of filesToCompress) {
      if (file.status === "done") {
        if (file.compressedUrl) revokeTrackedUrl(file.compressedUrl);
        updateFile(file.id, {
          status: "pending",
          progress: 0,
          compressedBlob: undefined,
          compressedSize: undefined,
          compressedUrl: undefined,
          error: undefined,
          compressedWidth: undefined,
          compressedHeight: undefined,
        });
      }
    }

    // Yield to the event loop so React can flush the state resets above
    // before we begin compressing. Without this, the UI may skip the "pending" state.
    await new Promise((r) => setTimeout(r, 10));

    // Compress files sequentially to keep UI responsive
    for (const file of filesToCompress) {
      updateFile(file.id, { status: "compressing", progress: 0 });

      try {
        const result = await compressImage(file.file, {
          quality,
          onProgress: (progress) => {
            updateFile(file.id, { progress });
          },
        });

        // If "compressed" result is larger (common with already-optimized JPEGs),
        // keep the original to avoid regressing the user's file size.
        if (result.blob.size >= file.size) {
          const originalUrl = URL.createObjectURL(file.file);
          trackUrl(originalUrl);
          updateFile(file.id, {
            status: "done",
            progress: 100,
            compressedBlob: file.file,
            compressedSize: file.size,
            compressedUrl: originalUrl,
            compressedWidth: result.width,
            compressedHeight: result.height,
          });
        } else {
          const compressedUrl = URL.createObjectURL(result.blob);
          trackUrl(compressedUrl);
          updateFile(file.id, {
            status: "done",
            progress: 100,
            compressedBlob: result.blob,
            compressedSize: result.blob.size,
            compressedUrl,
            compressedWidth: result.width,
            compressedHeight: result.height,
          });
        }
      } catch (err) {
        updateFile(file.id, {
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Compression failed",
        });
      }
    }

    setIsCompressing(false);
  }, [files, quality, updateFile]);

  const downloadSingle = useCallback((file: CompressFile) => {
    if (!file.compressedBlob) return;
    const mimeToExt: Record<string, string> = {
      "image/webp": "webp",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "image/bmp": "bmp",
    };
    const ext = mimeToExt[file.compressedBlob.type] || file.name.split(".").pop() || "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    saveAs(file.compressedBlob, `compressed_${baseName}.${ext}`);
  }, []);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter(
      (f) => f.status === "done" && f.compressedBlob
    );

    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1) {
      downloadSingle(doneFiles[0]);
      return;
    }

    const mimeToExt: Record<string, string> = {
      "image/webp": "webp",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "image/bmp": "bmp",
    };

    const zipFiles = doneFiles.map((f) => {
      const ext = mimeToExt[f.compressedBlob!.type] || f.name.split(".").pop() || "jpg";
      const baseName = f.name.replace(/\.[^.]+$/, "");
      return {
        name: `compressed_${baseName}.${ext}`,
        blob: f.compressedBlob!,
      };
    });

    const zipBlob = await createZip(zipFiles);
    saveAs(zipBlob, "compressed_images.zip");
  }, [files, downloadSingle]);

  const resetFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        if (file.compressedUrl) revokeTrackedUrl(file.compressedUrl);
        updateFile(id, {
          status: "pending",
          progress: 0,
          compressedBlob: undefined,
          compressedSize: undefined,
          compressedUrl: undefined,
          error: undefined,
          compressedWidth: undefined,
          compressedHeight: undefined,
        });
      }
    },
    [files, updateFile]
  );

  const doneCount = files.filter((f) => f.status === "done").length;
  const totalReduction = files.reduce((acc, f) => {
    if (f.status === "done" && f.compressedSize) {
      return acc + (f.size - f.compressedSize);
    }
    return acc;
  }, 0);

  return {
    files,
    quality,
    setQuality,
    isCompressing,
    errors,
    dismissError,
    addFiles,
    removeFile,
    clearFiles,
    compressAll,
    downloadSingle,
    downloadAll,
    resetFile,
    doneCount,
    totalReduction,
  };
}
