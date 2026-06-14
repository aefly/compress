"use client";

import {
    X,
    RotateCcw,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
    FileImage,
    Copy,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "./progress-bar";
import { Comparison } from "./comparison";
import { CompressFile } from "@/lib/constants";
import { formatSize, truncateName } from "@/lib/utils";
import { useState, useCallback } from "react";

interface FileCardProps {
    file: CompressFile;
    onRemove: (id: string) => void;
    onDownload: (file: CompressFile) => void;
    onReset: (id: string) => void;
}

export function FileCard({
    file,
    onRemove,
    onDownload,
    onReset,
}: FileCardProps) {
    const [showComparison, setShowComparison] = useState(false);
    const [copied, setCopied] = useState(false);

    // Copy compressed image to clipboard. Two attempts:
    // 1. Direct blob write (works for PNG/JPEG/WebP in Chromium).
    // 2. Canvas fallback: re-draw and export as PNG (for blobs the Clipboard API rejects, e.g. GIF).
    const handleCopy = useCallback(async () => {
        if (!file.compressedBlob) return;
        try {
            const blob = file.compressedBlob.type.startsWith("image/")
                ? file.compressedBlob
                : new Blob([file.compressedBlob], { type: "image/png" });
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            try {
                const img = new Image();
                const url = URL.createObjectURL(file.compressedBlob);
                img.onload = async () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob(async (pngBlob) => {
                            if (pngBlob) {
                                await navigator.clipboard.write([
                                    new ClipboardItem({ "image/png": pngBlob }),
                                ]);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }
                        }, "image/png");
                    }
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            } catch {
                // silent fail
            }
        }
    }, [file.compressedBlob]);

    const reduction =
        file.status === "done" && file.compressedSize
            ? ((1 - file.compressedSize / file.size) * 100).toFixed(1)
            : null;

    return (
        <div className="group overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex flex-col sm:flex-row">
                <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-auto sm:w-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {file.status === "compressing" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-[10px] font-medium text-white/80">
                                    {file.progress}%
                                </span>
                            </div>
                        </div>
                    )}

                    {file.status === "done" && (
                        <div className="absolute top-2 right-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>
                    )}

                    {file.status === "pending" && (
                        <div className="absolute bottom-2 left-2">
                            <div className="flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
                                <FileImage className="h-3 w-3 text-white/70" />
                                <span className="text-[10px] font-medium text-white/70">
                                    {file.type.split("/")[1]?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-2.5 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium leading-tight">
                                {truncateName(file.name)}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono">
                                    {formatSize(file.size)}
                                </span>
                                {file.status === "done" &&
                                    file.compressedSize && (
                                        <>
                                            <span className="text-border">
                                                →
                                            </span>
                                            <span className="font-mono text-emerald-500">
                                                {formatSize(
                                                    file.compressedSize,
                                                )}
                                            </span>
                                        </>
                                    )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {reduction && (
                                <Badge
                                    variant="secondary"
                                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-mono text-[11px]"
                                >
                                    -{reduction}%
                                </Badge>
                            )}
                            {file.status === "done" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        setShowComparison(!showComparison)
                                    }
                                    title="Compare"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {file.status === "done" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => onDownload(file)}
                                    title="Download"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {file.status === "done" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={handleCopy}
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            )}
                            {(file.status === "pending" ||
                                file.status === "error") && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => onRemove(file.id)}
                                    title="Remove"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {file.status === "done" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => onReset(file.id)}
                                    title="Reset"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {file.status === "done" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => onRemove(file.id)}
                                    title="Remove"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {file.status === "compressing" && (
                        <ProgressBar
                            value={file.progress}
                            status={file.status}
                        />
                    )}

                    {file.status === "error" && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>{file.error || "Compression failed"}</span>
                        </div>
                    )}

                    {file.status === "done" &&
                        file.compressedWidth &&
                        file.compressedHeight && (
                            <p className="text-[11px] text-muted-foreground/60 font-mono">
                                {file.compressedWidth} × {file.compressedHeight}
                            </p>
                        )}
                </div>
            </div>

            {showComparison && file.compressedUrl && (
                <Comparison
                    originalUrl={file.previewUrl}
                    compressedUrl={file.compressedUrl}
                    originalName={file.name}
                />
            )}
        </div>
    );
}
