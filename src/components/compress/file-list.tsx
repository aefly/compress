"use client";

import { CompressFile } from "@/lib/constants";
import { FileCard } from "./file-card";

interface FileListProps {
  files: CompressFile[];
  onRemove: (id: string) => void;
  onDownload: (file: CompressFile) => void;
  onReset: (id: string) => void;
}

export function FileList({
  files,
  onRemove,
  onDownload,
  onReset,
}: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {files.map((file, i) => (
        <div
          key={file.id}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <FileCard
            file={file}
            onRemove={onRemove}
            onDownload={onDownload}
            onReset={onReset}
          />
        </div>
      ))}
    </div>
  );
}
