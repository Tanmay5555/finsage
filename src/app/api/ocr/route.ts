import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loadVisionCredentials() {
  const b64 = process.env.GOOGLE_CREDENTIALS_JSON_BASE64;
  const raw = b64
    ? Buffer.from(b64, "base64").toString("utf8")
    : process.env.GOOGLE_CREDENTIALS_JSON || "{}";
  return JSON.parse(raw);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Lazy import to avoid build-time pdf-parse issues
  const pdfParse = (await import("pdf-parse")).default;
  try {
    const result = await pdfParse(buffer);
    return result.text || "";
  } catch (err) {
    console.warn("pdf-parse failed:", (err as Error)?.message);
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid multipart form" }, { status: 400 });
    }

    const fileEntry = formData.get("receipt");
    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    if (fileEntry.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (fileEntry.size > 8_000_000) {
      return NextResponse.json(
        { error: "File too large (>8MB)", hint: "Compress or reduce resolution" },
        { status: 413 }
      );
    }

    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = fileEntry.type;
    let text = "";

    if (mime === "application/pdf") {
      text = await extractPdfText(buffer);
      if (!text.trim()) {
        const credentials = loadVisionCredentials();
        const client = new ImageAnnotatorClient({ credentials });
        const [visionResult] = await client.documentTextDetection({ image: { content: buffer } });
        text = visionResult.fullTextAnnotation?.text || "";
      }
    } else {
      const credentials = loadVisionCredentials();
      const client = new ImageAnnotatorClient({ credentials });
      const [visionResult] = await client.textDetection({ image: { content: buffer } });
      text = visionResult.textAnnotations?.[0]?.description || "";
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No text detected", hint: "Check clarity / contrast" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("OCR route error:", message);
    return NextResponse.json({ error: "OCR failed", message }, { status: 500 });
  }
}