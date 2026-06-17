import JSZip from "jszip";

interface ZipFile {
  name: string;
  blob: Blob;
}

/** Creates a ZIP archive from an array of named blobs */
export async function createZip(files: ZipFile[]): Promise<Blob> {
  try {
    const zip = new JSZip();

    for (const file of files) {
      zip.file(file.name, file.blob);
    }

    return await zip.generateAsync({ type: "blob" });
  } catch {
    throw new Error("Failed to create ZIP archive.");
  }
}