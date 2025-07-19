import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || "{}");

    const client = new ImageAnnotatorClient({ credentials });

    // OCR from image buffer (no need to save to file)
    const [result] = await client.textDetection({ image: { content: buffer } });
    const text = result.textAnnotations?.[0]?.description || "";

    const lines = text.split("\n").map((line) => line.trim());
    const relevantLines = lines.filter((line) =>
      /total|amount|earning|income|paid/i.test(line)
    );

    let detectedAmount: string | null = null;
    for (const line of relevantLines) {
      const match = line.match(/([₹₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (match) {
        detectedAmount = match[1].replace(/[^0-9.]/g, "");
        break;
      }
    }

    return NextResponse.json({
      text,
      extractedAmount: detectedAmount || null,
    });
  } catch (err) {
    console.error("OCR route error:", err);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
