/**
 * Application-wide constants and types
 *
 * Changing limits here affects the UI (file count display, validation messages, etc)
 * so keep them in sync with any related UI text
 */

export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const DEFAULT_QUALITY = 80;

/** Files smaller than this are skipped — re-encoding tiny files often increases size */
export const MIN_COMPRESS_SIZE = 10 * 1024; // 10 KB

/** How long a toast notification stays visible before auto-dismissing */
export const TOAST_DURATION_MS = 5000;

/** Animation duration for a toast sliding out before removal. Must match CSS --animate-toast-exit */
export const TOAST_EXIT_MS = 300;

export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
] as const;

export const SUPPORTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
] as const;

/** Maps MIME types to file extensions for download filenames */
export const MIME_TO_EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/bmp": "bmp",
};

/** Human-readable labels for supported MIME types, shown in the UI */
export const MIME_TO_LABEL: Record<string, string> = {
  "image/webp": "WebP",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/gif": "GIF",
  "image/bmp": "BMP",
};

/** State tracked for each user-added file throughout the compression lifecycle */
export interface CompressFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  status: "pending" | "compressing" | "done" | "error";
  progress: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedUrl?: string;
  error?: string;
  compressedWidth?: number;
  compressedHeight?: number;
}