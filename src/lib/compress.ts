import UPNG from "upng-js";
import createGifsicle from "gifsicle-wasm";
import { SUPPORTED_FORMATS } from "./constants";

// Canvas can only encode JPEG, WebP, and BMP. PNG and GIF use specialized encoders.
function isCanvasSupportedFormat(type: string): boolean {
  return (
    type === "image/jpeg" ||
    type === "image/webp" ||
    type === "image/bmp"
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

// PNG compression via color quantization (upng-js).
// Reduces the number of colors so lossless PNG compression becomes more effective.
async function compressPng(file: File, quality: number): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const img = UPNG.decode(buffer);
  const rgba = UPNG.toRGBA8(img);

  // Map quality (0-100) to a color palette size (2-256).
  // Lower quality = fewer colors = smaller PNG after lossless compression.
  const maxColors = Math.max(2, Math.round((quality / 100) * 256));

  const quantized = UPNG.encode(rgba, img.width, img.height, maxColors);
  return new Blob([quantized], { type: "image/png" });
}

// GIF compression via gifsicle WASM binary.
// Uses lossy compression and color reduction to shrink animated/static GIFs.
async function compressGif(file: File, quality: number): Promise<Blob> {
  const buffer = new Uint8Array(await file.arrayBuffer());

  // gifsicle uses inverted semantics: higher --lossy = more aggressive compression.
  // Map user quality (high = keep quality) to gifsicle params (high = more loss).
  const lossy = Math.round(200 - (quality / 100) * 180);
  const colors = Math.max(16, Math.round(16 + (quality / 100) * 240));

  const wasmResponse = await fetch("/gifsicle.wasm");
  const wasmBinary = await wasmResponse.arrayBuffer();
  const mod = await createGifsicle({ wasmBinary });

  mod.FS.writeFile("/input.gif", buffer);

  // Build gifsicle CLI args and pass to WASM entry point
  const args = [
    "gifsicle",
    "-O3",
    `--lossy=${lossy}`,
    `--colors=${colors}`,
    "-o",
    "/output.gif",
    "/input.gif",
  ];

  // gifsicle's WASM entry point expects a C-style argv array.
  // Allocate pointers on the WASM heap, then free after the call to avoid leaks.
  const argv = mod._malloc((args.length + 1) * 4);
  const ptrs: number[] = [];
  for (let i = 0; i < args.length; i++) {
    const p = mod.stringToNewUTF8(args[i]);
    ptrs.push(p);
    mod.setValue(argv + i * 4, p, "i32");
  }
  mod.setValue(argv + args.length * 4, 0, "i32");

  mod._run_gifsicle(args.length, argv);

  ptrs.forEach((p) => mod._free(p));
  mod._free(argv);

  const output = mod.FS.readFile("/output.gif");
  const outputBuffer = new Uint8Array(output).buffer;

  // Return original if compressed result is larger
  if (outputBuffer.byteLength >= buffer.length) {
    return new Blob([buffer], { type: "image/gif" });
  }
  return new Blob([outputBuffer], { type: "image/gif" });
}

export interface CompressOptions {
  quality: number; // 0-100
  onProgress?: (progress: number) => void;
}

export interface CompressResult {
  blob: Blob;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<CompressResult> {
  const { quality, onProgress } = options;

  if (!SUPPORTED_FORMATS.includes(file.type as (typeof SUPPORTED_FORMATS)[number])) {
    throw new Error(`Unsupported format: ${file.type}`);
  }

  onProgress?.(10);

  if (file.type === "image/png") {
    onProgress?.(30);
    const blob = await compressPng(file, quality);
    onProgress?.(80);

    const buffer = await file.arrayBuffer();
    const decoded = UPNG.decode(buffer);

    onProgress?.(100);
    return { blob, width: decoded.width, height: decoded.height };
  }

  if (file.type === "image/gif") {
    onProgress?.(30);
    const blob = await compressGif(file, quality);
    onProgress?.(100);

    // UPNG cannot decode animated GIF dimensions reliably,
    // so we load the file into an <img> to extract natural dimensions.
    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = URL.createObjectURL(file);
    });

    return { blob, width: dims.width, height: dims.height };
  }

  if (!isCanvasSupportedFormat(file.type)) {
    onProgress?.(100);
    return { blob: file, width: 0, height: 0 };
  }

  // Skip canvas-based compression for files under 10 KB.
  // Re-encoding tiny files often increases their size due to format overhead.
  if (file.size < 10 * 1024) {
    onProgress?.(100);
    return { blob: file, width: 0, height: 0 };
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  onProgress?.(30);

  const img = await loadImage(dataUrl);

  onProgress?.(50);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(img, 0, 0);

  onProgress?.(70);

  const outputType = file.type;
  const qualityNorm = quality / 100;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to compress image"));
      },
      outputType,
      qualityNorm
    );
  });

  onProgress?.(100);

  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}
