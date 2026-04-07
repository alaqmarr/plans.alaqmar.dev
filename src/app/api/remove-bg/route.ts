import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const fallback = async (reason: string) => {
    console.warn(`remove-bg skipped: ${reason}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    return new NextResponse(buffer, {
      headers: { "Content-Type": file.type, "X-Skipped": "true", "X-Reason": reason },
    });
  };

  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) return fallback("no API key configured");

  try {
    const rbFormData = new FormData();
    rbFormData.append("image_file", file);
    rbFormData.append("size", "auto");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: rbFormData,
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      return fallback(`remove.bg API error ${res.status}: ${msg}`);
    }

    const resultBuffer = Buffer.from(await res.arrayBuffer());
    return new NextResponse(resultBuffer, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (e: any) {
    // Network errors (ENOTFOUND, ECONNREFUSED, timeout, etc.) — always fall back gracefully
    return fallback(e?.cause?.code || e?.message || "network error");
  }
}
