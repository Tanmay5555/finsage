import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VisionCredentials {
  private_key: string;
  client_email: string;
  [k: string]: unknown;
}

function loadVisionCredentials(): VisionCredentials {
  const b64 = process.env.GOOGLE_CREDENTIALS_JSON_BASE64;
  const raw = b64
    ? Buffer.from(b64, "base64").toString("utf8")
    : process.env.GOOGLE_CREDENTIALS_JSON || "{}";

  try {
    const parsed = JSON.parse(raw) as VisionCredentials;
    if (!parsed.private_key || !parsed.client_email) {
      throw new Error("Missing credential key fields");
    }
    return parsed;
  } catch {
    console.error("Credential parse failed head:", raw.slice(0, 80));
    throw new Error("Invalid Vision credentials JSON");
  }
}

async function extractPdfEmbedded(buffer: Buffer, debug = false): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    const text = result.text || "";
    if (debug) {
      console.log("[OCR] pdf-parse text length:", text.length);
    }
    return text;
  } catch (err) {
    console.warn("[OCR] pdf-parse failed:", (err as Error).message);
    return "";
  }
}

async function extractWithVision(
  buffer: Buffer,
  credentials: VisionCredentials,
  debug = false
): Promise<string> {
  const client = new ImageAnnotatorClient({ credentials, fallback: true });

  const [docResult] = await client.documentTextDetection({ image: { content: buffer } });
  let text =
    docResult.fullTextAnnotation?.text ||
    docResult.textAnnotations?.[0]?.description ||
    "";

  if (debug) {
    console.log("[OCR] documentTextDetection length:", text.length);
  }

  if (!text.trim()) {
    const [simple] = await client.textDetection({ image: { content: buffer } });
    const alt =
      simple.textAnnotations?.[0]?.description ||
      simple.fullTextAnnotation?.text ||
      "";
    if (debug) {
      console.log("[OCR] textDetection fallback length:", alt.length);
    }
    if (alt.trim()) text = alt;
  }

  return text;
}

export async function POST(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get("debug") === "1";

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
    if (fileEntry.size < 1500) {
      return NextResponse.json({ error: "File too small (likely blank)" }, { status: 400 });
    }
    if (fileEntry.size > 10_000_000) {
      return NextResponse.json(
        { error: "File too large (>10MB)", hint: "Compress or reduce resolution." },
        { status: 413 }
      );
    }

    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = fileEntry.type;
    const credentials = loadVisionCredentials();

    let text = "";

    if (mime === "application/pdf") {
      text = await extractPdfEmbedded(buffer, debug);
      if (text.trim().length < 15) {
        if (debug) console.log("[OCR] Embedded PDF text too short; falling back to Vision");
        text = "";
      }
      if (!text.trim()) {
        text = await extractWithVision(buffer, credentials, debug);
      }
    } else {
      text = await extractWithVision(buffer, credentials, debug);
    }

    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();

    if (!text) {
      return NextResponse.json(
        {
          error: "No text detected",
          hint: "Try a clearer scan (focus, lighting) or upload a higher quality source.",
        },
        { status: 422 }
      );
    }

    if (debug) console.log("[OCR] Final returned length:", text.length);
    return NextResponse.json({
      text,
      source: mime === "application/pdf" ? "pdf-hybrid" : "vision",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("OCR route error:", message);
    return NextResponse.json({ error: "OCR failed", message }, { status: 500 });
  }
}
