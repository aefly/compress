/**
 * Image compression utilities
 *
 * Supports JPEG/WebP/BMP via Canvas, PNG via upng-js (color quantization),
 * and GIF via gifsicle-wasm. All processing happens client-side —
 * no files leave the browser
 *
 * IMPORTANT: This module runs on the main thread — large files may block the UI
 * Consider offloading to a Web Worker if latency becomes an issue (see AGENTS.md)
 */
import UPNG from "upng-js";
import createGifsicle from "gifsicle-wasm";
import { SUPPORTED_FORMATS, MIN_COMPRESS_SIZE } from "./constants";

/** Canvas can only natively encode JPEG, WebP, and BMP — not PNG or GIF */
function isCanvasSupportedFormat(type: string): boolean {
  return (
    type === "image/jpeg" ||
    type === "image/webp" ||
    type === "image/bmp"
  );
}

const IMAGE_LOAD_TIMEOUT_MS = 30_000;

/** Loads an <img> from a URL with a timeout to prevent infinite hangs */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      reject(new Error("Image loading timed out"));
      img.onload = null;
      img.onerror = null;
    }, IMAGE_LOAD_TIMEOUT_MS);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Failed to load image"));
    };
    img.src = src;
  });
}

/**
 * PNG compression via color quantization (upng-js)
 *
 * Reduces the color palette so lossless PNG compression becomes more effective
 * Quality (0–100) maps to maxColors (2–256): lower quality = fewer colors = smaller file
 */
async function compressPng(file: File, quality: number): Promise<Blob> {
  try {
    const buffer = await file.arrayBuffer();
    const img = UPNG.decode(buffer);
    const rgba = UPNG.toRGBA8(img);

    const maxColors = Math.max(2, Math.round((quality / 100) * 256));

    const quantized = UPNG.encode(rgba, img.width, img.height, maxColors);
    return new Blob([quantized], { type: "image/png" });
  } catch {
    throw new Error("PNG compression failed. The file may be corrupted or use an unsupported color mode.");
  }
}

/** Cached gifsicle WASM module — avoids re-fetching the .wasm binary on every call */
let gifsicleModule: Awaited<ReturnType<typeof createGifsicle>> | null = null;

async function getGifsicleModule() {
  if (!gifsicleModule) {
    const wasmResponse = await fetch("/gifsicle.wasm");
    const wasmBinary = await wasmResponse.arrayBuffer();
    gifsicleModule = await createGifsicle({ wasmBinary });
  }
  return gifsicleModule;
}

/**
 * GIF compression via gifsicle-wasm
 *
 * Gifsicle uses inverted semantics: higher --lossy = more aggressive
 * Quality (0–100, where 100 = keep quality) is mapped to gifsicle's
 * --lossy (180–20) and --colors (16–256)
 */
async function compressGif(file: File, quality: number): Promise<Blob> {
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());

    const lossy = Math.round(200 - (quality / 100) * 180);
    const colors = Math.max(16, Math.round(16 + (quality / 100) * 240));

    const mod = await getGifsicleModule();
    mod.FS.writeFile("/input.gif", buffer);

    const args = [
      "gifsicle",
      "-O3",
      `--lossy=${lossy}`,
      `--colors=${colors}`,
      "-o",
      "/output.gif",
      "/input.gif",
    ];

    // Allocate argv pointers on the WASM heap, then free in finally to prevent leaks
    const argv = mod._malloc((args.length + 1) * 4);
    const ptrs: number[] = [];
    try {
      for (let i = 0; i < args.length; i++) {
        const p = mod.stringToNewUTF8(args[i]);
        ptrs.push(p);
        mod.setValue(argv + i * 4, p, "i32");
      }
      mod.setValue(argv + args.length * 4, 0, "i32");

      mod._run_gifsicle(args.length, argv);
    } finally {
      ptrs.forEach((p) => mod._free(p));
      mod._free(argv);
    }

    const output = mod.FS.readFile("/output.gif");
    const outputBuffer = new Uint8Array(output).buffer;

    // Return original if compression didn't reduce size
    if (outputBuffer.byteLength >= buffer.length) {
      return new Blob([buffer], { type: "image/gif" });
    }
    return new Blob([outputBuffer], { type: "image/gif" });
  } catch {
    throw new Error("GIF compression failed. The file may be corrupted or in an unsupported format.");
  }
}

export interface CompressOptions {
  quality: number; // 0–100
  onProgress?: (progress: number) => void;
}

export interface CompressResult {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Compresses an image file client-side
 *
 * Routing:
 *   PNG  → upng-js color quantization
 *   GIF  → gifsicle-wasm (lossy + color reduction)
 *   JPEG/WebP/BMP (≥10 KB) → Canvas API with quality parameter
 *   Anything else → returned as-is
 */
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

    // Decode again to extract dimensions (upng-js already decoded once but
    // the width/height are only available from the decode result)
    const buffer = await file.arrayBuffer();
    const decoded = UPNG.decode(buffer);

    onProgress?.(100);
    return { blob, width: decoded.width, height: decoded.height };
  }

  if (file.type === "image/gif") {
    onProgress?.(30);
    const blob = await compressGif(file, quality);
    onProgress?.(80);

    // UPNG can't decode animated GIF dimensions, so we load into an <img>
    // The Object URL is revoked in finally to prevent memory leaks
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImage(objectUrl);
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      onProgress?.(100);
      return { blob, ...dims };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Unsupported canvas formats fall through as-is
  if (!isCanvasSupportedFormat(file.type)) {
    onProgress?.(100);
    return { blob: file, width: 0, height: 0 };
  }

  // Tiny files often get larger after re-encoding — skip them
  if (file.size < MIN_COMPRESS_SIZE) {
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