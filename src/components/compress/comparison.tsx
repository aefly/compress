"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ComparisonProps {
  originalUrl: string;
  compressedUrl: string;
  originalName: string;
}

export function Comparison({
  originalUrl,
  compressedUrl,
  originalName,
}: ComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      return Math.max(1, Math.min(5, prev + delta));
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener("pointerup", handleGlobalUp);
    return () => window.removeEventListener("pointerup", handleGlobalUp);
  }, [isDragging]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((prev) => Math.max(0, prev - 2));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((prev) => Math.min(100, prev + 2));
    }
  }, []);

  const imgStyle = {
    transform: `translate(-50%, -50%) scale(${zoom})`,
    transformOrigin: "center center",
  };

  return (
    <div className="border-t border-border/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Before / After
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            disabled={zoom <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[3ch] text-center text-[10px] font-mono text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
            disabled={zoom >= 5}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors ml-1"
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative aspect-video w-full cursor-col-resize overflow-hidden rounded-xl select-none ring-1 ring-border/50 bg-muted/30"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label={`Comparison slider for ${originalName}`}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={compressedUrl}
          alt={`${originalName} compressed`}
          className="absolute top-1/2 left-1/2 max-h-full max-w-full object-contain pointer-events-none"
          style={imgStyle}
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt={`${originalName} original`}
            className="absolute top-1/2 left-1/2 max-h-full max-w-full object-contain"
            style={imgStyle}
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.4)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-xl backdrop-blur-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="text-black"
            >
              <path
                d="M5 3L2 8L5 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 3L14 8L11 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="absolute top-3 left-3 z-10">
          <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            Before
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            After
          </span>
        </div>
      </div>
    </div>
  );
}