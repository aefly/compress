"use client";

import { Slider } from "@/components/ui/slider";

interface CompressionSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function CompressionSlider({
  value,
  onChange,
  disabled,
}: CompressionSliderProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card/50 px-4 py-3">
      <label
        htmlFor="quality-slider"
        className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
      >
        Quality
      </label>
      <Slider
        id="quality-slider"
        min={1}
        max={100}
        step={1}
        value={value}
        onValueChange={(v) => {
          const val = Array.isArray(v) ? v[0] : v;
          onChange(val);
        }}
        disabled={disabled}
        className="flex-1"
      />
      <span className="min-w-[3.5ch] text-right font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
