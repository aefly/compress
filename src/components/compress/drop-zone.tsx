"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_FILES, SUPPORTED_FORMATS, SUPPORTED_EXTENSIONS } from "@/lib/constants";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  fileCount: number;
}

export function DropZone({ onFiles, fileCount }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_FILES - fileCount;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFiles(droppedFiles);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      onFiles(selected);
      e.target.value = "";
    },
    [onFiles]
  );

  const handleBrowseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  if (remaining <= 0) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop zone for image files. Drag and drop images or press Enter to browse."
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex cursor-default flex-col items-center justify-center gap-5 rounded-2xl p-10 transition-all duration-300 sm:p-14",
        isDragOver
          ? "bg-primary/5 scale-[1.02] shadow-[0_0_40px_-10px_oklch(0.65 0.25 280 / 0.3)]"
          : "hover:bg-muted/30"
      )}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <rect
          x="1"
          y="1"
          rx="16"
          ry="16"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
          className={cn(
            "transition-colors duration-300 marching-ants",
            isDragOver
              ? "text-primary"
              : "text-border group-hover:text-muted-foreground/30"
          )}
        />
      </svg>

      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent animate-fade-in" />
      )}

      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 transition-all duration-300",
          isDragOver && "bg-primary/15 scale-110"
        )}
      >
        {isDragOver ? (
          <ImagePlus className="h-6 w-6 text-primary" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">
          {isDragOver ? "Drop images here" : "Drag & drop images here"}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          or{" "}
          <button
            type="button"
            onClick={handleBrowseClick}
            className="font-medium text-primary underline underline-offset-2 decoration-primary/30 cursor-pointer hover:text-primary/80 transition-colors"
          >
            click to browse
          </button>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/60">
        <span>Up to {remaining} more file{remaining !== 1 ? "s" : ""}</span>
        <span>·</span>
        <span>{SUPPORTED_EXTENSIONS.map((e) => e.replace(".", "").toUpperCase()).join(", ")}</span>
        <span>·</span>
        <span>Max 50 MB</span>
      </div>

      <label htmlFor="file-upload-input" className="sr-only">
        Select image files
      </label>
      <input
        id="file-upload-input"
        ref={inputRef}
        type="file"
        accept={[...SUPPORTED_FORMATS, ...SUPPORTED_EXTENSIONS].join(",")}
        multiple
        className="sr-only"
        onChange={handleInputChange}
      />
    </div>
  );
}