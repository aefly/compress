"use client";

import { Download, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  onDownloadAll: () => void;
  doneCount: number;
  disabled?: boolean;
}

export function DownloadButton({
  onDownloadAll,
  doneCount,
  disabled,
}: DownloadButtonProps) {
  if (doneCount === 0) return null;

  return (
    <Button
      onClick={onDownloadAll}
      disabled={disabled}
      size="lg"
      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
    >
      {doneCount > 1 ? (
        <>
          <Archive className="h-4 w-4" />
          Download ZIP ({doneCount})
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download
        </>
      )}
    </Button>
  );
}
