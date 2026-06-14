import JSZip from "jszip";

interface ZipFile {
  name: string;
  blob: Blob;
}

export async function createZip(files: ZipFile[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.blob);
  }

  return zip.generateAsync({ type: "blob" });
}
