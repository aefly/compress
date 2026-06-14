"use client";

import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  status: "pending" | "compressing" | "done" | "error";
}

export function ProgressBar({ value, status }: ProgressBarProps) {
  if (status === "pending" || status === "error") return null;

  return (
    <Progress value={value} className="w-full">
      <ProgressTrack className="h-1 rounded-full bg-primary/10">
        <ProgressIndicator className="rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300" />
      </ProgressTrack>
    </Progress>
  );
}
