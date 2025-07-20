import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import pdfParse from "pdf-parse";
import { CloudCog } from "lucide-react";

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
    const file = formData.get("receipt");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type;
    let text = "";

    if (mime === "application/pdf") {
      // 1. Try embedded text first
      try {
        const parsed = await pdfParse(buffer);
        text = parsed.text || "";
        // console.log("PDF text", text);
      } catch (e) {
        console.warn("pdf-parse failed, continuing to Vision fallback:", e);
      }

      // 2. Fallback to Vision if empty
      if (!text.trim()) {
        const credentials = loadVisionCredentials();
        const client = new ImageAnnotatorClient({ credentials });

        // documentTextDetection works for PDFs (small) or images
        const [visionResult] = await client.documentTextDetection({
          image: { content: buffer },
        });

        text = visionResult.fullTextAnnotation?.text || "";
        if (!text.trim()) {
          return NextResponse.json(
            {
              error: "No text detected (PDF may be blank or unsupported).",
              hint: "If this is a scanned multi-page PDF, ensure size <2MB or upload via GCS.",
            },
            { status: 422 }
          );
        }
      }
    } else {
      // Image route (JPEG/PNG)
      const credentials = loadVisionCredentials();
      const client = new ImageAnnotatorClient({ credentials });
      const [result] = await client.textDetection({ image: { content: buffer } });
      text = result.textAnnotations?.[0]?.description || "";
      if (!text.trim()) {
        return NextResponse.json(
          { error: "No text detected in image." },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("OCR route error:", err);
    return NextResponse.json(
      {
        error: "OCR failed",
        message: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
