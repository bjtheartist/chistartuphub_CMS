/**
 * Client-side storage helper for uploading files to S3
 */

export interface StorageUploadResult {
  key: string;
  url: string;
}

export async function storagePut(file: File): Promise<StorageUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const result = await response.json();
  return result;
}
