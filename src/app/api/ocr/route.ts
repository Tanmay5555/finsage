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
        { error: "File too large (>8MB)", hint: "Compress or reduce resolution." },
        { status: 413 }
      );
    }

    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = fileEntry.type;

    const credentials = loadVisionCredentials();
    const client = new ImageAnnotatorClient({ credentials });

    // Use documentTextDetection for PDFs (and you can also use it for images; it works for both)
    const visionMethod =
      mime === "application/pdf"
        ? client.documentTextDetection({ image: { content: buffer } })
        : client.textDetection({ image: { content: buffer } });

    const [visionResult] = await visionMethod;

    let text = "";

    if (mime === "application/pdf") {
      // documentTextDetection path
      text = visionResult.fullTextAnnotation?.text || "";
    } else {
      // image path
      text = visionResult.textAnnotations?.[0]?.description || "";
      if (!text && visionResult.fullTextAnnotation?.text) {
        text = visionResult.fullTextAnnotation.text;
      }
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No text detected", hint: "Ensure clarity / contrast / proper scan." },
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
