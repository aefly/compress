"use client";

import { Upload, Shrink, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/compress/drop-zone";
import { FileList } from "@/components/compress/file-list";
import { CompressionSlider } from "@/components/compress/compression-slider";
import { DownloadButton } from "@/components/compress/download-button";
import { ToastContainer } from "@/components/compress/toast";
import { useCompress } from "@/hooks/use-compress";
import { formatSize } from "@/lib/utils";

const steps = [
    {
        icon: Upload,
        label: "Import",
        description: "Drop or browse your images",
        number: "1",
    },
    {
        icon: Shrink,
        label: "Compress",
        description: "Adjust quality, one click",
        number: "2",
    },
    {
        icon: Download,
        label: "Download",
        description: "Get your optimized files",
        number: "3",
    },
] as const;

export default function Home() {
    const {
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
    } = useCompress();

    const hasFiles = files.length > 0;
    const hasDone = doneCount > 0;

    return (
        <section className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-20">
            <ToastContainer toasts={errors} onDismiss={dismissError} />

            <div className="mb-12 text-center animate-fade-up">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    <Shield className="h-3 w-3" />
                    100% private
                </div>
                <h1
                    className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                    Compress images
                    <span className="block text-muted-foreground font-normal mt-1 text-lg sm:text-xl">
                        without leaving your browser
                    </span>
                </h1>
            </div>

            <div className="mb-10 grid grid-cols-3 gap-3 animate-fade-up animate-stagger-1">
                {steps.map((s) => (
                    <div
                        key={s.label}
                        className="group flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-5 transition-all duration-300"
                    >
                        <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                                <s.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {s.number}
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold">{s.label}</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                                {s.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="animate-fade-up animate-stagger-2">
                <DropZone onFiles={addFiles} fileCount={files.length} />
            </div>

            {hasFiles && (
                <div className="mt-10 space-y-5 animate-fade-up animate-stagger-3">
                    <FileList
                        files={files}
                        onRemove={removeFile}
                        onDownload={downloadSingle}
                        onReset={resetFile}
                    />

                    <div className="h-px bg-border/50" />

                    <CompressionSlider
                        value={quality}
                        onChange={setQuality}
                        disabled={isCompressing}
                    />

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            onClick={compressAll}
                            disabled={isCompressing}
                            size="lg"
                            className="gap-2 shadow-lg shadow-primary/20"
                        >
                            <Shrink className="h-4 w-4" />
                            {isCompressing
                                ? "Compressing..."
                                : `Compress ${files.length} ${files.length === 1 ? "image" : "images"}`}
                        </Button>

                        <DownloadButton
                            onDownloadAll={downloadAll}
                            doneCount={doneCount}
                            disabled={isCompressing}
                        />

                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={clearFiles}
                            disabled={isCompressing}
                            className="text-muted-foreground"
                        >
                            Clear all
                        </Button>
                    </div>

                    {hasDone && totalReduction > 0 && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center animate-scale-in">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Saved{" "}
                                <span className="font-mono font-semibold">
                                    {formatSize(totalReduction)}
                                </span>{" "}
                                total
                            </p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
