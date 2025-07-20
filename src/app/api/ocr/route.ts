import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import pdfParse from "pdf-parse";

// export const dynamic = "force-dynamic"; // Uncomment if needed in App Router

function loadVisionCredentials() {
  const b64 = process.env.GOOGLE_CREDENTIALS_JSON_BASE64;
  const raw = b64
    ? Buffer.from(b64, "base64").toString("utf8")
    : process.env.GOOGLE_CREDENTIALS_JSON || "{}";
  return JSON.parse(raw);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("receipt");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const mime = fileEntry.type;
    let text = "";

    if (mime === "application/pdf") {
      // 1. Try extracting embedded text
      try {
        const parsed = await pdfParse(buffer);
        text = parsed.text || "";
      } catch (parseErr) {
        console.warn("pdf-parse failed; attempting Vision fallback");
      }

      // 2. Fallback to Vision OCR if no embedded text
      if (!text.trim()) {
        const credentials = loadVisionCredentials();
        const client = new ImageAnnotatorClient({ credentials });

        const [visionResult] = await client.documentTextDetection({
          image: { content: buffer },
        });

        text = visionResult.fullTextAnnotation?.text || "";
        if (!text.trim()) {
          return NextResponse.json(
            {
              error: "No text detected (PDF may be blank or purely image-based).",
              hint: "If this is a scanned multi‑page PDF, ensure size <2MB or upload to GCS for async processing.",
            },
            { status: 422 }
          );
        }
      }
    } else {
      // Image (JPEG/PNG/etc.)
      const credentials = loadVisionCredentials();
      const client = new ImageAnnotatorClient({ credentials });
      const [imgResult] = await client.textDetection({ image: { content: buffer } });

      text = imgResult.textAnnotations?.[0]?.description || "";
      if (!text.trim()) {
        return NextResponse.json(
          { error: "No text detected in image." },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("OCR route error:", err);
    return NextResponse.json(
      {
        error: "OCR failed",
        message,
      },
      { status: 500 }
    );
  }
}
