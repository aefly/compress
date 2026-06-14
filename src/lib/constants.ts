export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const DEFAULT_QUALITY = 80;

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
