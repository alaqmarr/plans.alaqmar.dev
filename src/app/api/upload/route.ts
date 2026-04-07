import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const customFilename = formData.get("filename") as string;
    const folder = (formData.get("folder") as string) || "payments";

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = file.name.split('.').pop() || "jpg";
    
    // Sanitize customFilename and file.name to prevent R2 Signature/URI errors
    const safeCustom = customFilename ? customFilename.replace(/[^a-zA-Z0-9.\-_]/g, '_') : '';
    const safeFile = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    let finalName = safeCustom || safeFile;
    
    // Prevent double extensions like .pdf.pdf
    if (!finalName.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
      finalName = `${finalName}.${extension}`;
    }
      
    const key = `${folder}/${finalName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file to R2" }, { status: 500 });
  }
}
