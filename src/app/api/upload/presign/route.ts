import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: NextRequest) {
  try {
    const bucket = process.env.R2_BUCKET;
    if (!bucket) {
      throw new Error("R2_BUCKET is strictly undefined in the environment.");
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const { filename, folder, fileType } = await req.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: "Missing filename or fileType" }, { status: 400 });
    }

    const safeFolder = folder || "payments";
    
    // Sanitize to prevent R2 Signature mismatch
    const safeFile = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const extension = filename.split('.').pop() || "pdf";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    
    let finalName = safeFile.endsWith(`.${extension}`) ? safeFile : `${safeFile}.${extension}`;
    finalName = `${uniqueSuffix}_${finalName}`;

    const key = `${safeFolder}/${finalName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });

    // Create Presigned URL valid for 5 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;

    return NextResponse.json({ presignedUrl, publicUrl });
  } catch (error) {
    console.error("Presign Error:", error);
    return NextResponse.json({ error: "Failed to generate presigned upload URL", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
