import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) return new NextResponse("Failed to fetch image", { status: res.status });
    
    const buf = await res.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const mime = res.headers.get("content-type") || "image/png";
    
    return NextResponse.json({ base64: `data:${mime};base64,${base64}` });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
