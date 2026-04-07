export async function uploadFileToR2(file: File, folder: string, customFilename?: string): Promise<string> {
  // 1. Fetch Presigned URL directly from our secure generator
  const res = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: customFilename || file.name,
      fileType: file.type || "application/octet-stream",
      folder,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.details || errData.error || "Failed to generate upload link");
  }

  const { presignedUrl, publicUrl } = await res.json();

  // 2. Bypass Vercel strictly and upload payload straight to Cloudflare R2 Object Storage
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to safely persist file to storage endpoint (Error: ${uploadRes.status})`);
  }

  return publicUrl;
}
