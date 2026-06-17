/**
 * Core state management hook for the compression workflow
 *
 * Manages the full lifecycle: add files → compress → download, plus
 * Object URL tracking to prevent memory leaks
 *
 * PRIVACY GUARANTEE: No file data ever leaves the browser
 * All compression is performed client-side by src/lib/compress.ts
 */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { compressImage } from "@/lib/compress";
import { createZip } from "@/lib/zip";
import {
  CompressFile,
  MAX_FILES,
  MAX_FILE_SIZE,
  DEFAULT_QUALITY,
  SUPPORTED_FORMATS,
  MIME_TO_EXT,
} from "@/lib/constants";
import { saveAs } from "file-saver";
import { truncateName, formatSize } from "@/lib/utils";

// Module-level counter ensures unique IDs even when multiple files are added
// in the same millisecond. Not in React state because it must not trigger re-renders
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

  // Track every Object URL created so they can be revoked on unmount
  // or when a file is removed, preventing memory leaks
  const urlsRef = useRef<Set<string>>(new Set());

  function trackUrl(url: string) {
    urlsRef.current.add(url);
  }

  function revokeTrackedUrl(url: string) {
    URL.revokeObjectURL(url);
    urlsRef.current.delete(url);
  }

  // Cleanup all Object URLs when the hook unmounts
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
      if (remaining <= 0) return;

      const toAdd = newFiles.slice(0, remaining);
      // Notify the user if some files were silently dropped due to the limit
      const dropped = newFiles.length - toAdd.length;
      const newErrors: FileError[] = [];

      if (dropped > 0) {
        newErrors.push({
          id: generateId(),
          message: `Only ${remaining} more file${remaining === 1 ? "" : "s"} can be added. ${dropped} file${dropped === 1 ? "was" : "were"} not added.`,
        });
      }

      const valid = toAdd.filter((f) => {
        if (f.size > MAX_FILE_SIZE) {
          newErrors.push({
            id: generateId(),
            message: `"${truncateName(f.name)}" exceeds 50 MB limit (${formatSize(f.size)})`,
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

    // Reset any previously compressed or errored files back to pending
    // Revokes stale Object URLs before they are replaced
    setFiles((prev) =>
      prev.map((f) => {
        if (f.status === "done") {
          if (f.compressedUrl) revokeTrackedUrl(f.compressedUrl);
          return {
            ...f,
            status: "pending" as const,
            progress: 0,
            compressedBlob: undefined,
            compressedSize: undefined,
            compressedUrl: undefined,
            error: undefined,
            compressedWidth: undefined,
            compressedHeight: undefined,
          };
        }
        if (f.status === "error") {
          return { ...f, status: "pending" as const, progress: 0, error: undefined };
        }
        return f;
      })
    );

    // Flush the state resets above so React renders "pending" before we start
    flushSync(() => {});

    const currentFiles = files.filter(
      (f) =>
        f.status === "pending" ||
        f.status === "error" ||
        f.status === "done"
    );

    // Compress sequentially to keep the UI responsive
    for (const file of currentFiles) {
      updateFile(file.id, { status: "compressing", progress: 0 });

      try {
        const result = await compressImage(file.file, {
          quality,
          onProgress: (progress) => {
            updateFile(file.id, { progress });
          },
        });

        // If the compressed result is larger (or equal), keep the original
        // so the user never gets a bigger file after "compressing"
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
    try {
      const ext = MIME_TO_EXT[file.compressedBlob.type] || file.name.split(".").pop() || "jpg";
      const baseName = file.name.replace(/\.[^.]+$/, "");
      saveAs(file.compressedBlob, `compressed_${baseName}.${ext}`);
    } catch {
      setErrors((prev) => [
        ...prev,
        { id: generateId(), message: "Failed to download file. Your browser may block downloads in this context." },
      ]);
    }
  }, []);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter(
      (f) => f.status === "done" && f.compressedBlob
    );

    if (doneFiles.length === 0) return;

    // Single file: download directly instead of creating a one-file ZIP
    if (doneFiles.length === 1) {
      downloadSingle(doneFiles[0]);
      return;
    }

    try {
      const zipFiles = doneFiles.map((f) => {
        const ext = MIME_TO_EXT[f.compressedBlob!.type] || f.name.split(".").pop() || "jpg";
        const baseName = f.name.replace(/\.[^.]+$/, "");
        return {
          name: `compressed_${baseName}.${ext}`,
          blob: f.compressedBlob!,
        };
      });

      const zipBlob = await createZip(zipFiles);
      saveAs(zipBlob, "compressed_images.zip");
    } catch {
      setErrors((prev) => [
        ...prev,
        { id: generateId(), message: "Failed to create ZIP archive." },
      ]);
    }
  }, [files, downloadSingle]);

  const resetFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === id);
        if (file?.compressedUrl) revokeTrackedUrl(file.compressedUrl);
        return prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "pending" as const,
                progress: 0,
                compressedBlob: undefined,
                compressedSize: undefined,
                compressedUrl: undefined,
                error: undefined,
                compressedWidth: undefined,
                compressedHeight: undefined,
              }
            : f
        );
      });
    },
    []
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